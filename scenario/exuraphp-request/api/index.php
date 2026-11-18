<?php
// core/exura.php, as fetched by `php exura php` (the nearest core/ up the folders)
for ($dir = __DIR__; !is_file("$dir/core/exura.php") && dirname($dir) !== $dir; $dir = dirname($dir));
if (!is_file("$dir/core/exura.php")) {
  http_response_code(500);
  header('Content-Type: application/json');
  exit(json_encode(['error' => ['message' => 'core/exura.php is missing (run: php exura php)']]));
}
require "$dir/core/exura.php";

Exura::module(['GET', 'POST'], 'read', fn() => ['data' => [
  'name' => Exura::method('name', 'nobody'),
  'all'  => Exura::method(),
]]);

Exura::module('POST', 'create', function () {
  Exura::return(['data' => ['title' => Exura::method('title')]], 201);
});

Exura::module('GET', 'shape', function () {
  Exura::header(['X-Scenario: exuraphp-request']);
  Exura::data('first', 1);
  Exura::data('second', 2);
  return [];
});

Exura::fallback();
