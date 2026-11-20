<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // tests create fake orders and logins: keep them out of the real log files
        foreach (['stack', 'single', 'daily', 'orders', 'admin', 'queue'] as $channel) {
            config(["logging.channels.{$channel}" => config('logging.channels.null')]);
        }
    }
}
