<?php

namespace Tests\Feature;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class SchedulerTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_crashed_task_is_only_locked_for_a_few_minutes(): void
    {
        $events = app(Schedule::class)->events();

        $this->assertNotEmpty($events);

        foreach ($events as $event) {
            $this->assertTrue($event->withoutOverlapping, $event->command);
            $this->assertSame(10, $event->expiresAt, $event->command);
        }
    }

    public function test_pruning_removes_only_expired_cache_rows(): void
    {
        config(['cache.default' => 'database']);
        $store = Cache::store('database');

        $store->put('catalog:v1:old', 'old', 60);
        $store->put('catalog:v2:new', 'new', 7200);
        $store->forever('catalog:version', 2);

        $this->travel(2)->minutes();

        $this->artisan('cache:prune-expired')->assertSuccessful();

        $this->assertSame(2, DB::table('cache')->count());
        $this->assertSame('new', $store->get('catalog:v2:new'));
        $this->assertSame(2, $store->get('catalog:version'));
    }

    public function test_pruning_does_nothing_on_another_cache_store(): void
    {
        $this->artisan('cache:prune-expired')->assertSuccessful();
    }
}
