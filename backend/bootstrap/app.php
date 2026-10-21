<?php

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Throwable;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // local helper so every error response shares the same shape 
        $res = fn(string $message, int $status, ?array $errors = null) =>
        response()->json([
            'success' => false,
            'message' => $message,
            'data' => null,
            'errors' => $errors
        ], $status);

        $exceptions->shouldRenderJsonWhen(
            fn(Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(function (Throwable $e, Request $request) use ($res) {
            if (! $request->is('api/*') && ! $request->expectsJson()) {
                return null;
            }

            return match (true) {
                $e instanceof ValidationException => $res('The given data was invalid', 422, $e->errors()),

                $e instanceof AuthenticationException => $res('Unauthenticated. Please provide a valid API token.', 401),

                $e instanceof AuthorizationException => $res($e->getMessage() ?: 'This action is unauthorized.', 403),

                // ModelNotFoundException is wrapped into NotFoundHttpException by
                // Handler::prepareException() before this callback runs, so the
                // original is only reachable via getPrevious().
                $e instanceof NotFoundHttpException && $e->getPrevious() instanceof ModelNotFoundException
                => $res('The requested resource was not found.', 404),

                $e instanceof NotFoundHttpException => $res('The requested API endpoint does not exists.', 404),

                // Rate Limiting
                $e instanceof TooManyRequestsHttpException => $res('Too many requestes. Please slow down.', 429),

                // anything with its own status like abort(403)...
                $e instanceof HttpExceptionInterface => $res($e->getMessage() ?: 'Request failed.', $e->getStatusCode()),

                default => $res(
                    config('app.debug') ? $e->getMessage() : 'Unexpected error occurred. Please try again later.',
                    500,
                    config('app.debug') ? [
                        'exeption' => $e::class,
                        'file' => $e->getFile(),
                        'line' => $e->getLine()
                    ] : null
                )
            };
        });

        $exceptions->dontReport([
            ModelNotFoundException::class,
            ValidationException::class
        ]);
    })->create();
