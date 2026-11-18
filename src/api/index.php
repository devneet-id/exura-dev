<?php
/**
 * exuraphp playground — served at /api/<route> by `php cast serve`.
 * Also works behind Apache/nginx as api/index.php?/route.
 */
// exura.php as fetched by `php exura php` (EXURA_DIST in the exura runite)
$repo = dirname(__DIR__, 2);
preg_match("#const EXURA_DIST = '([^']*)';#", (string) @file_get_contents("$repo/exura"), $m);
$exura = $repo . '/' . ($m[1] ?? 'src/vessel/') . 'exura.php';
if (!is_file($exura)) {
  http_response_code(500);
  header('Content-Type: application/json');
  exit(json_encode(['error' => ['message' => 'exura.php is not fetched yet (run: php exura php)']]));
}
require $exura;

// tiny JSON file store for the notes demo (src/.data is git-ignored)
function notes(?array $save = null): array {
  $dir  = getenv('EXURA_DEV_DATA') ?: dirname(__DIR__) . '/.data'; // tests point this to a temp folder
  $file = $dir . '/notes.json';
  if ($save !== null) {
    if (!is_dir(dirname($file))) mkdir(dirname($file), 0777, true);
    file_put_contents($file, json_encode(array_values($save), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    return $save;
  }
  return is_file($file) ? (json_decode(file_get_contents($file), true) ?: []) : [];
}

function lastSegment(): string {
  $parts = explode('/', trim(ExuraEnvironment::getRoute(), '/'));
  return end($parts);
}

// GET /api/hello
Exura::module('GET', 'hello', function () {
  return ['data' => 'Hello World 👋'];
});

// any method: echoes what Exura::method() reads (JSON body, form data, query)
Exura::module(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], 'echo', function () {
  return ['data' => [
    'request' => ExuraEnvironment::getRequest(),
    'method'  => Exura::method(),
    'name'    => Exura::method('name', 'nobody'),
  ]];
});

// GET /api/user/42 — wildcard route
Exura::module('GET', 'user/*', function () {
  return ['data' => ['id' => lastSegment()]];
});

// notes: list, create, remove
Exura::module('GET', 'notes', function () {
  return ['data' => notes()];
});

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

Exura::module(['PUT', 'PATCH'], 'notes/*', function () {
  $id = (int) lastSegment();
  $list = notes();
  foreach ($list as &$note) {
    if ($note['id'] === $id) {
      $note['done'] = (bool) Exura::method('done', !$note['done']);
      notes($list);
      return ['data' => $note];
    }
  }
  Exura::return(['error' => ['message' => "note $id not found"]], 404);
});

Exura::module('DELETE', 'notes/*', function () {
  $id = (int) lastSegment();
  notes(array_filter(notes(), fn($note) => $note['id'] !== $id));
  return ['data' => ['deleted' => $id]];
});

Exura::module('DELETE', 'notes', function () {
  notes([]);
  return ['data' => []];
});

// GET /api/fail — an exception becomes a 500 JSON
Exura::module('GET', 'fail', function () {
  throw new Exception('Something went wrong 💥');
});

// GET /api/warn — a PHP warning becomes a 500 JSON
Exura::module('GET', 'warn', function () {
  $list = [];
  return ['data' => $list['missing'] . ''];
});

Exura::fallback();
