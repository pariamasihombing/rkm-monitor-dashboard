<?php

/** @var \Laravel\Lumen\Routing\Router $router */

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

$router->get('/', function () use ($router) {
    return $router->app->version();
});

$router->get('/api/dashboard', 'DashboardController@index');
$router->post('/api/reminders/send', 'NotificationController@sendReminders');
$router->get('/api/weekly-monitoring', 'WeeklyMonitoringController@index');
$router->get('/api/users', function () {
    return response()->json([
        'message' => 'Use POST /api/users to create a user and send an email notification.',
    ]);
});
$router->post('/api/users', 'UserController@store');
$router->post('/api/notify-password', 'UserController@notifyPassword');

$router->get('/api/programs', 'ProgramController@index');
$router->get('/api/programs/{id}', 'ProgramController@show');
$router->post('/api/programs', 'ProgramController@store');
$router->put('/api/programs/{id}', 'ProgramController@update');
$router->delete('/api/programs/{id}', 'ProgramController@destroy');

$router->post('/api/stages', 'StageController@store');
$router->get('/api/stages/{id}', 'StageController@show');
$router->put('/api/stages/{id}', 'StageController@update');
$router->delete('/api/stages/{id}', 'StageController@destroy');

$router->post('/api/subtasks', 'SubtaskController@store');
$router->get('/api/subtasks/{id}', 'SubtaskController@show');
$router->put('/api/subtasks/{id}', 'SubtaskController@update');
$router->delete('/api/subtasks/{id}', 'SubtaskController@destroy');

// Route to serve uploaded files - Catch all pattern
$router->get('/uploads/{filename:.*}', function ($filename) {
    try {
        // Decode filename to handle spaces and special characters correctly
        $decodedFilename = urldecode($filename);
        $path = base_path('public/uploads/' . $decodedFilename);

        // Security: Prevent directory traversal
        $realPath = realpath($path);
        $uploadsDir = realpath(base_path('public/uploads'));
        
        if (!$realPath || !$uploadsDir || strpos($realPath, $uploadsDir) !== 0) {
            return response('File not found', 404);
        }

        if (!file_exists($realPath)) {
            return response('File not found', 404);
        }

        $file = file_get_contents($realPath);
        $mimeType = mime_content_type($realPath) ?: 'application/octet-stream';
        $displayFilename = basename($realPath);

        return response($file, 200)
            ->header('Content-Type', $mimeType)
            ->header('Content-Disposition', 'inline; filename="' . $displayFilename . '"')
            ->header('Cache-Control', 'public, max-age=86400');
    } catch (\Exception $e) {
        return response('Error: ' . $e->getMessage(), 500);
    }
});
