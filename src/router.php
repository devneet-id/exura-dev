<?php
/**
 * Router for `php -S` (started by `php cast serve`).
 *
 *   /vessel/<file>   an Exura file fetched by `php exura` (its EXURA_DIST folder)
 *   /api/<route>     the exuraphp playground (api/index.php), as if served at /api/index.php
 *   anything else    a static file of src/, or index.html of a folder
 */

$root = __DIR__;
$repo = dirname($root);
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

// the Exura files: wherever `php exura` puts them (EXURA_DIST in the exura runite)
if (str_starts_with($path, '/vessel/')) {
  preg_match("#const EXURA_DIST = '([^']*)';#", (string) @file_get_contents("$repo/exura"), $m);
  $vessel = realpath($repo . '/' . ($m[1] ?? 'src/vessel/'));
  $file = $vessel ? realpath($vessel . '/' . substr($path, 8)) : false;
  if ($file && str_starts_with($file, $vessel . DIRECTORY_SEPARATOR) && is_file($file)) {
    return $send($file);
  }
  $fetch = [
    'exura.css'      => 'php exura css',
    'exura-clip.css' => 'php exura css --part=clip',
    'exura.js'       => 'php exura js',
    'exura.php'      => 'php exura php',
  ][substr($path, 8)] ?? 'php exura setup';
  http_response_code(404);
  header('Content-Type: text/plain; charset=utf-8');
  echo "Not fetched yet: {$path} (run: $fetch)";
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

// static files of src/
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
