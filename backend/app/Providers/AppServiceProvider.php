<?php

namespace App\Providers;

use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Queue\Events\JobFailed;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return config('app.frontend_url')."/password-reset/$token?email={$notifiable->getEmailForPasswordReset()}";
        });

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('orders', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });

        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(6)->by($request->ip());
        });

        $this->logAuthEvents();
        $this->logFailedJobs();
    }

    // logins and failed logins go to the admin log. never log the password: Failed carries it in credentials
    private function logAuthEvents(): void
    {
        Event::listen(Login::class, fn(Login $e) => Log::channel('admin')->info('auth.login', [
            'user_id' => $e->user->getAuthIdentifier(),
            'email' => $e->user->email,
            'ip' => request()->ip(),
        ]));

        Event::listen(Failed::class, fn(Failed $e) => Log::channel('admin')->warning('auth.login_failed', [
            'email' => $e->credentials['email'] ?? null,
            'user_exists' => $e->user !== null,
            'ip' => request()->ip(),
        ]));

        Event::listen(Lockout::class, fn(Lockout $e) => Log::channel('admin')->warning('auth.lockout', [
            'email' => $e->request->input('email'),
            'ip' => $e->request->ip(),
        ]));

        Event::listen(Logout::class, fn(Logout $e) => Log::channel('admin')->info('auth.logout', [
            'user_id' => $e->user?->getAuthIdentifier(),
            'ip' => request()->ip(),
        ]));
    }

    // one place for every job that gives up after its last try (emails, reminders...)
    private function logFailedJobs(): void
    {
        Queue::failing(fn(JobFailed $e) => Log::channel('queue')->error('job.failed', [
            'job' => $e->job->resolveName(),
            'job_id' => $e->job->getJobId(),
            'queue' => $e->job->getQueue(),
            'attempts' => $e->job->attempts(),
            'exception' => $e->exception,
        ]));
    }
}
