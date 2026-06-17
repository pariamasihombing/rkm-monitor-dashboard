<?php

/**
 * Lumen - A PHP Framework By Taylor Otwell
 * Modified to handle file uploads properly
 *
 * @package  Lumen
 * @author   Taylor Otwell <taylor@laravel.com>
 */

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH)
);

// Handle file uploads from /uploads/ directory
if (strpos($uri, '/uploads/') === 0) {
    $filename = str_replace('/uploads/', '', $uri);
    $file = __DIR__.'/public/uploads/'.$filename;
    
    // Remove query string if present
    if (($pos = strpos($file, '?')) !== false) {
        $file = substr($file, 0, $pos);
    }
    
    // Security: Prevent directory traversal attacks
    $realPath = realpath($file);
    $uploadsDir = realpath(__DIR__.'/public/uploads');
    
    if ($realPath && $uploadsDir && strpos($realPath, $uploadsDir) === 0 && file_exists($realPath) && is_file($realPath)) {
        // Determine MIME type
        $ext = strtolower(pathinfo($realPath, PATHINFO_EXTENSION));
        $mimeTypes = [
            'pdf' => 'application/pdf',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'dmg' => 'application/x-apple-diskimage',
            'zip' => 'application/zip',
            'txt' => 'text/plain',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls' => 'application/vnd.ms-excel',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        
        $mimeType = $mimeTypes[$ext] ?? mime_content_type($realPath) ?? 'application/octet-stream';
        
        // Send file
        header('Content-Type: '.$mimeType);
        header('Content-Length: '.filesize($realPath));
        header('Cache-Control: public, max-age=86400');
        header('Content-Disposition: inline; filename="'.basename($realPath).'"');
        readfile($realPath);
        exit;
    }
    
    // File not found
    header('HTTP/1.0 404 Not Found');
    die('File not found');
}

// This file allows us to emulate Apache's "mod_rewrite" functionality from the
// built-in PHP web server. This provides a convenient way to test a Lumen
// application without having installed a "real" web server software here.
if ($uri !== '/' && file_exists(__DIR__.'/public'.$uri)) {
    return false;
}

require_once __DIR__.'/public/index.php';
