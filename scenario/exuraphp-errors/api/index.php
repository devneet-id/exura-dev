<?php
// core/exura.php, as fetched by `php exura php` (the nearest core/ up the folders)
for ($dir = __DIR__; !is_file("$dir/core/exura.php") && dirname($dir) !== $dir; $dir = dirname($dir));
if (!is_file("$dir/core/exura.php")) {
  http_response_code(500);
  header('Content-Type: application/json');
  exit(json_encode(['error' => ['message' => 'core/exura.php is missing (run: php exura php)']]));
}
require "$dir/core/exura.php";

Exura::module('GET', 'exception', function () {
  throw new Exception('boom');
});

Exura::module('GET', 'warning', function () {
  $list = [];
  return ['data' => $list['missing'] . ''];
});

Exura::module('GET', 'undefined', function () {
  return ['data' => no_such_function()];
});

Exura::module('GET', 'notice', function () {
  trigger_error('only a notice', E_USER_NOTICE);
  return ['data' => 'ok'];
});

Exura::module('GET', 'silenced', function () {
  $list = [];
  return ['data' => @$list['missing'] ?? 'quiet'];
});

Exura::fallback();
