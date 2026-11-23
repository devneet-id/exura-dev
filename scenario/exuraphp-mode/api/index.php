<?php
// core/exura.php, as fetched by `php exura php` (the nearest core/ up the folders)
for ($dir = __DIR__; !is_file("$dir/core/exura.php") && dirname($dir) !== $dir; $dir = dirname($dir));
if (!is_file("$dir/core/exura.php")) {
  http_response_code(500);
  header('Content-Type: application/json');
  exit(json_encode(['error' => ['message' => 'core/exura.php is missing (run: php exura php)']]));
}
require "$dir/core/exura.php";

// development: the default — no configure() call

// the same routes in both modes
Exura::module('GET', 'settings', fn() => ['data' => method_exists('Exura', 'configure') ? Exura::configure() : null]);
Exura::module('GET', 'hello', fn() => ['data' => 'hello']);
Exura::module('GET', 'notice', function () { trigger_error('an old call', E_USER_DEPRECATED); return ['data' => 'ok']; });
Exura::module('GET', 'boom', function () { throw new RuntimeException('the database is down'); });

Exura::fallback();
