<?php

namespace App\Http\Middleware;

use Closure;

class CorsMiddleware
{
    public function handle($request, Closure $next)
    {
        $origin = $request->headers->get('Origin', '*');

        $headers = [
            'Access-Control-Allow-Origin'      => $origin,
            'Access-Control-Allow-Methods'     => 'POST, GET, OPTIONS, PUT, PATCH, DELETE',
            'Access-Control-Allow-Credentials' => 'false',
            'Access-Control-Allow-Max-Age'     => '86400',
            'Access-Control-Allow-Headers'     => 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
            'Vary'                             => 'Origin',
        ];

        if ($request->isMethod('OPTIONS')) {
            return response('', 204, $headers);
        }

        $response = $next($request);
        
        // Handle both standard responses and symfony responses
        if (method_exists($response, 'header')) {
            foreach ($headers as $key => $value) {
                $response->header($key, $value);
            }
        } else {
            foreach ($headers as $key => $value) {
                $response->headers->set($key, $value);
            }
        }

        return $response;
    }
}
