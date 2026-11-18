<?php
/**
 * exuraphp — every feature as a route.
 * `php cast exploration` serves it at /exuraphp/api/<route>;
 * behind Apache/nginx it also answers exuraphp/api/index.php?/route.
 */

// core/exura.php, as fetched by `php exura php` (the nearest core/ up the folders)
for ($dir = __DIR__; !is_file("$dir/core/exura.php") && dirname($dir) !== $dir; $dir = dirname($dir));
if (!is_file("$dir/core/exura.php")) {
  http_response_code(500);
  header('Content-Type: application/json');
  exit(json_encode(['error' => ['message' => 'core/exura.php is missing (run: php exura php)']]));
}
require "$dir/core/exura.php";

function lastSegment(): string {
  $parts = explode('/', trim(ExuraEnvironment::getRoute(), '/'));
  return end($parts);
}

// GET hello — the smallest route
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

// GET user/42 — wildcard route
Exura::module('GET', 'user/*', function () {
  return ['data' => ['id' => lastSegment()]];
});

// GET status/418 — Exura::return($data, $code)
Exura::module('GET', 'status/*', function () {
  $code = (int) lastSegment() ?: 200;
  Exura::return(['data' => "answered with $code"], $code);
});

// GET header — Exura::header() and Exura::data()
Exura::module('GET', 'header', function () {
  Exura::header(['X-Exura: playground']);
  Exura::data('first', 1);
  Exura::data('second', 2);
  return [];
});

// GET fail — an exception becomes a 500 JSON
Exura::module('GET', 'fail', function () {
  throw new Exception('Something went wrong 💥');
});

// GET warn — a PHP warning becomes a 500 JSON
Exura::module('GET', 'warn', function () {
  $list = [];
  return ['data' => $list['missing'] . ''];
});

// GET notice — a deprecation is only noted in the trace; the answer stays 200
Exura::module('GET', 'notice', function () {
  trigger_error('this is only a notice', E_USER_NOTICE);
  return ['data' => 'still 200'];
});

// anything else: 404 JSON
Exura::fallback();
