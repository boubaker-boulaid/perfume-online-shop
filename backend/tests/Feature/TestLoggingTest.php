<?php

namespace Tests\Feature;

use Illuminate\Support\Arr;
use Monolog\Handler\NullHandler;
use Tests\TestCase;

class TestLoggingTest extends TestCase
{
    // a channel that writes to a file would put fake orders in the real logs on every test run.
    // a new channel added to config/logging.php has to be added to the list in TestCase too
    public function test_no_channel_writes_to_a_file_during_tests(): void
    {
        foreach (config('logging.channels') as $name => $channel) {
            if (in_array($channel['driver'] ?? null, ['single', 'daily'], true)) {
                $this->fail("The [{$name}] log channel writes to a file during tests.");
            }
        }

        $this->assertSame(NullHandler::class, Arr::get(config('logging.channels.orders'), 'handler'));
    }
}
