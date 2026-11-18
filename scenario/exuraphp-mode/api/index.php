<?php
// core/exura.php, as fetched by `php exura php` (the nearest core/ up the folders)
for ($dir = __DIR__; !is_file("$dir/core/exura.php") && dirname($dir) !== $dir; $dir = dirname($dir));
if (!is_file("$dir/core/exura.php")) {
  http_response_code(500);
  header('Content-Type: application/json');
  exit(json_encode(['error' => ['message' => 'core/exura.php is missing (run: php exura php)']]));
}
require "$dir/core/exura.php";

// development | production
// guarded: on a version without environment() the routes still answer and the page shows ✗
if (method_exists('Exura', 'environment')) {
  Exura::environment([
    'mode' => 'development',
  ]);
}

Exura::module('GET', 'mode', fn() => ['data' => ['environment' => method_exists('Exura', 'environment')]]);

Exura::module('GET', 'hello', fn() => ['data' => 'hello']);

Exura::fallback();
