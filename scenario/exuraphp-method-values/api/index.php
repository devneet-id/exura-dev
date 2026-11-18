<?php
// core/exura.php, as fetched by `php exura php` (the nearest core/ up the folders)
for ($dir = __DIR__; !is_file("$dir/core/exura.php") && dirname($dir) !== $dir; $dir = dirname($dir));
if (!is_file("$dir/core/exura.php")) {
  http_response_code(500);
  header('Content-Type: application/json');
  exit(json_encode(['error' => ['message' => 'core/exura.php is missing (run: php exura php)']]));
}
require "$dir/core/exura.php";

// every key the client sent, with its value and PHP type, as Exura::method() reads it
Exura::module(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], 'read', function () {
  $all = Exura::method();
  $read = [];
  foreach (is_array($all) ? array_keys($all) : [] as $key) {
    $value = Exura::method($key, '«default»');
    $read[$key] = ['value' => $value, 'type' => get_debug_type($value)];
  }
  $read['missing'] = ['value' => Exura::method('missing', '«default»'), 'type' => 'string'];
  return ['data' => ['read' => $read, 'files' => array_keys($_FILES)]];
});

Exura::fallback();
