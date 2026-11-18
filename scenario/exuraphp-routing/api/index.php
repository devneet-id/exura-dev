<?php
// core/exura.php, as fetched by `php exura php` (the nearest core/ up the folders)
for ($dir = __DIR__; !is_file("$dir/core/exura.php") && dirname($dir) !== $dir; $dir = dirname($dir));
if (!is_file("$dir/core/exura.php")) {
  http_response_code(500);
  header('Content-Type: application/json');
  exit(json_encode(['error' => ['message' => 'core/exura.php is missing (run: php exura php)']]));
}
require "$dir/core/exura.php";

Exura::module('GET', 'hello', fn() => ['data' => 'hello']);

Exura::module(['PUT', 'PATCH'], 'item', fn() => ['data' => ExuraEnvironment::getRequest()]);

Exura::module('GET', 'user/*', function () {
  $parts = explode('/', trim(ExuraEnvironment::getRoute(), '/'));
  return ['data' => $parts[array_search('user', $parts) + 1] ?? null];
});

Exura::fallback();
