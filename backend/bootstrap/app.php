<?php

use App\Http\Middleware\AssignRequestId;
use App\Http\Middleware\EnsureEmailIsVerified;
use App\Http\Middleware\EnsureGuest;
use App\Http\Middleware\IsAdmin;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\LostConnectionDetector;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Context;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->prepend(AssignRequestId::class);

        $middleware->api(prepend: [
            EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->alias([
            'verified' => EnsureEmailIsVerified::class,
            'admin' => IsAdmin::class,
            'guest' => EnsureGuest::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // local helper so every error response shares the same shape
        $res = fn (string $message, int $status, ?array $errors = null) => response()->json([
            'success' => false,
            'message' => $message,
            'data' => null,
            'errors' => $errors,
            'request_id' => Context::get('request_id'),
        ], $status);

        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(function (Throwable $e, Request $request) use ($res) {
            if (! $request->is('api/*') && ! $request->expectsJson()) {
                return null;
            }

            return match (true) {
                $e instanceof ValidationException => $res('Les données saisies ne sont pas valides.', 422, $e->errors()),

                $e instanceof AuthenticationException => $res('Vous devez être connecté pour effectuer cette action.', 401),

                $e instanceof AuthorizationException => $res($e->getMessage() ?: 'Cette action n’est pas autorisée.', 403),

                // ModelNotFoundException is wrapped into NotFoundHttpException by
                // Handler::prepareException() before this callback runs, so the
                // original is only reachable via getPrevious().
                $e instanceof NotFoundHttpException && $e->getPrevious() instanceof ModelNotFoundException => $res('La ressource demandée est introuvable.', 404),

                $e instanceof NotFoundHttpException => $res('Cette adresse d’API n’existe pas.', 404),

                // Rate Limiting
                // keep the Retry-After header so the client knows how long to wait
                $e instanceof TooManyRequestsHttpException => $res('Trop de requêtes. Veuillez patienter un instant.', 429)
                    ->withHeaders($e->getHeaders()),

                // anything with its own status like abort(403)...
                // __() translates the framework's own English messages, from lang/fr.json
                $e instanceof MethodNotAllowedHttpException => $res('Cette méthode n’est pas autorisée pour cette adresse.', 405),

                $e instanceof HttpExceptionInterface => $res(__($e->getMessage()) ?: 'La requête a échoué.', $e->getStatusCode()),

                // the database can't be reached: nothing the customer did wrong, and worth retrying soon
                ($e instanceof QueryException || $e instanceof PDOException)
                && (new LostConnectionDetector)->causedByLostConnection($e) => $res('Le service est temporairement indisponible. Veuillez réessayer dans quelques instants.', 503),

                default => $res(
                    config('app.debug') ? $e->getMessage() : 'Une erreur inattendue s’est produite. Veuillez réessayer plus tard.',
                    500,
                    config('app.debug') ? [
                        'exception' => $e::class,
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                    ] : null
                )
            };
        });

        $exceptions->dontReport([
            ModelNotFoundException::class,
            ValidationException::class,
        ]);
    })->create();
