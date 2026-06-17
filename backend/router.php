<?php
/**
 * Router for PHP Development Server
 * This file allows the PHP built-in development server to handle requests properly
 */

// Get the requested URI
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Handle static files from public directory
if ($uri !== '/' && file_exists(__DIR__ . '/public' . $uri)) {
    return false; // Let the server handle the static file
}

// Handle uploads directory specially
if (strpos($uri, '/uploads/') === 0) {
    $file = __DIR__ . '/public' . $uri;
    
    // Security: Prevent directory traversal
    $realPath = realpath($file);
    $uploadsDir = realpath(__DIR__ . '/public/uploads');
    
    if ($realPath && $uploadsDir && strpos($realPath, $uploadsDir) === 0 && file_exists($realPath)) {
        // File found, serve it
        $mimeType = mime_content_type($realPath) ?: 'application/octet-stream';
        header('Content-Type: ' . $mimeType);
        header('Content-Length: ' . filesize($realPath));
        header('Cache-Control: public, max-age=86400');
        readfile($realPath);
        exit;
    }
}

// All other requests go to the index.php
require_once __DIR__ . '/public/index.php';
