<?php
/**
 * Router for `php -S` (started by `php dev serve`).
 *
 *   /pkg/<package>/<file>   a file from packages/<package>/dist (e.g. /pkg/exuracss/exura.min.css)
 *   /api/<route>            the exuraphp playground (api/index.php), as if served at /api/index.php
 *   anything else           a static file of playground/, or index.html of a folder
 */

$root = __DIR__;
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/');

$types = [
  'css'  => 'text/css; charset=utf-8',
  'js'   => 'text/javascript; charset=utf-8',
  'mjs'  => 'text/javascript; charset=utf-8',
  'html' => 'text/html; charset=utf-8',
  'json' => 'application/json; charset=utf-8',
  'php'  => 'text/plain; charset=utf-8',
  'svg'  => 'image/svg+xml',
];

$send = function (string $file) use ($types) {
  $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
  header('Content-Type: ' . ($types[$ext] ?? 'application/octet-stream'));
  header('Cache-Control: no-store');
  readfile($file);
  return true;
};

// package dist files
if (preg_match('#^/pkg/(exuracss|exurajs|exuraphp)/(.+)$#', $path, $m)) {
  $dist = realpath(dirname($root) . "/packages/{$m[1]}/dist");
  $file = $dist ? realpath("$dist/{$m[2]}") : false;
  if ($file && str_starts_with($file, $dist . DIRECTORY_SEPARATOR) && is_file($file)) {
    return $send($file);
  }
  http_response_code(404);
  echo "Not in packages/{$m[1]}/dist: {$m[2]} (run: php dev build {$m[1]})";
  return true;
}

// exuraphp playground: behave like a server that runs /api/index.php
if ($path === '/api' || str_starts_with($path, '/api/')) {
  $_SERVER['SCRIPT_NAME'] = '/api/index.php';
  $_SERVER['SCRIPT_FILENAME'] = "$root/api/index.php";
  chdir("$root/api");
  require "$root/api/index.php";
  return true;
}

// static playground files
$file = realpath($root . $path);
if ($file && is_dir($file)) {
  if (!str_ends_with($path, '/')) {
    header('Location: ' . $path . '/', true, 301);
    return true;
  }
  $file = realpath("$file/index.html");
}
if ($file && str_starts_with($file, $root) && is_file($file) && basename($file) !== 'router.php') {
  return $send($file);
}

http_response_code(404);
header('Content-Type: text/plain; charset=utf-8');
echo "404 · $path";
return true;
