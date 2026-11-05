<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\Middleware\RedirectIfAuthenticated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

// replaces Laravel's guest middleware: a logged-in API client gets a JSON error instead of a redirect
class EnsureGuest extends RedirectIfAuthenticated
{
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        foreach ($guards ?: [null] as $guard) {
            if ($request->expectsJson() && Auth::guard($guard)->check()) {
                abort(409, 'You are already logged in.');
            }
        }

        return parent::handle($request, $next, ...$guards);
    }
}
