<?php
/**
 * app — the CRUD API of the notes app, in exuraphp.
 * `php cast exploration` serves it at /app/api/<route>.
 *
 *   GET    notes        list
 *   GET    notes/1      read one
 *   POST   notes        create   {"title": "…"}
 *   PATCH  notes/1      update   {"title": "…"} and/or {"done": true}
 *   DELETE notes/1      delete one
 *   DELETE notes        delete all
 */

// core/exura.php, as fetched by `php exura php` (the nearest core/ up the folders)
for ($dir = __DIR__; !is_file("$dir/core/exura.php") && dirname($dir) !== $dir; $dir = dirname($dir));
if (!is_file("$dir/core/exura.php")) {
  http_response_code(500);
  header('Content-Type: application/json');
  exit(json_encode(['error' => ['message' => 'core/exura.php is missing (run: php exura php)']]));
}
require "$dir/core/exura.php";

// a tiny JSON file store (app/.data is git-ignored)
function notes(?array $save = null): array {
  $file = dirname(__DIR__) . '/.data/notes.json';
  if ($save !== null) {
    if (!is_dir(dirname($file))) mkdir(dirname($file), 0777, true);
    file_put_contents($file, json_encode(array_values($save), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    return $save;
  }
  return is_file($file) ? (json_decode(file_get_contents($file), true) ?: []) : [];
}

function noteId(): int {
  $parts = explode('/', trim(ExuraEnvironment::getRoute(), '/'));
  return (int) end($parts);
}

function notFound(int $id) {
  Exura::return(['error' => ['message' => "note $id not found"]], 404);
}

// list
Exura::module('GET', 'notes', function () {
  return ['data' => notes()];
});

// read one
Exura::module('GET', 'notes/*', function () {
  $id = noteId();
  foreach (notes() as $note) {
    if ($note['id'] === $id) return ['data' => $note];
  }
  notFound($id);
});

// create
Exura::module('POST', 'notes', function () {
  $title = trim((string) Exura::method('title', ''));
  if ($title === '') {
    Exura::return(['error' => ['message' => 'title is required']], 422);
  }
  $list = notes();
  $note = ['id' => (max(array_column($list, 'id') ?: [0]) + 1), 'title' => $title, 'done' => false];
  $list[] = $note;
  notes($list);
  Exura::return(['data' => $note], 201);
});

// update: title and/or done
Exura::module(['PUT', 'PATCH'], 'notes/*', function () {
  $id = noteId();
  $title = Exura::method('title', null);
  $done = Exura::method('done', null);
  if ($title !== null && trim((string) $title) === '') {
    Exura::return(['error' => ['message' => 'title can not be empty']], 422);
  }
  $list = notes();
  foreach ($list as &$note) {
    if ($note['id'] !== $id) continue;
    if ($title !== null) $note['title'] = trim((string) $title);
    if ($done !== null) $note['done'] = filter_var($done, FILTER_VALIDATE_BOOLEAN);
    notes($list);
    return ['data' => $note];
  }
  notFound($id);
});

// delete one
Exura::module('DELETE', 'notes/*', function () {
  $id = noteId();
  $list = notes();
  $left = array_filter($list, fn($note) => $note['id'] !== $id);
  if (count($left) === count($list)) notFound($id);
  notes($left);
  return ['data' => ['deleted' => $id]];
});

// delete all
Exura::module('DELETE', 'notes', function () {
  notes([]);
  return ['data' => []];
});

Exura::fallback();
