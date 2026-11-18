<?php
/**
 * Router of `php cast` — serves one folder (exploration/ or a scenario/<name>/) as the site root.
 *
 *   /core/<file>      the Exura files of core/ (fetched by `php exura`), for every folder
 *   a file            served as is; .php files run
 *   anything else     the nearest index.php up the path (exuraphp routes: /api/notes → api/index.php),
 *                     else the nearest index.html (exurajs router: /user/42 → index.html)
 */

$repo = __DIR__;
$root = rtrim(str_replace('\\', '/', $_SERVER['DOCUMENT_ROOT']), '/');
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/');

// core/: one copy of Exura for every folder
if (str_starts_with($path, '/core/')) {
  $core = realpath("$repo/core");
  $file = $core ? realpath($core . '/' . substr($path, 6)) : false;
  if ($file && str_starts_with($file, $core . DIRECTORY_SEPARATOR) && is_file($file)) {
    $type = ['css' => 'text/css', 'js' => 'text/javascript', 'php' => 'text/plain'][pathinfo($file, PATHINFO_EXTENSION)] ?? 'application/octet-stream';
    header("Content-Type: $type; charset=utf-8");
    header('Cache-Control: no-store');
    readfile($file);
    return true;
  }
  $fetch = [
    'exura.css'      => 'php exura css',
    'exura-clip.css' => 'php exura css --part=clip',
    'exura.js'       => 'php exura js',
    'exura.php'      => 'php exura php',
  ][substr($path, 6)] ?? 'php exura setup';
  http_response_code(404);
  header('Content-Type: text/plain; charset=utf-8');
  echo "Not in core/ yet: $path (run: $fetch)";
  return true;
}

// an existing file or a folder with an index: the built-in server handles it
$target = realpath($root . $path);
if ($target && str_starts_with(str_replace('\\', '/', $target), $root)) {
  if (is_file($target)) return false;
  if (is_dir($target) && (is_file("$target/index.php") || is_file("$target/index.html"))) {
    if (!str_ends_with($path, '/')) {
      header('Location: ' . $path . '/', true, 301);
      return true;
    }
    return false;
  }
}

// the nearest index.php up the path, as a front controller (exuraphp routes)
$dir = rtrim($path, '/');
while (true) {
  $dir = $dir === '' ? '' : dirname($dir);
  $dir = $dir === '/' || $dir === '.' ? '' : $dir;
  if (is_file("$root$dir/index.php")) {
    $_SERVER['SCRIPT_NAME'] = "$dir/index.php";
    $_SERVER['SCRIPT_FILENAME'] = "$root$dir/index.php";
    chdir("$root$dir");
    require "$root$dir/index.php";
    return true;
  }
  if (is_file("$root$dir/index.html")) {
    header('Content-Type: text/html; charset=utf-8');
    readfile("$root$dir/index.html");
    return true;
  }
  if ($dir === '') break;
}

http_response_code(404);
header('Content-Type: text/plain; charset=utf-8');
echo "404 · $path";
return true;
