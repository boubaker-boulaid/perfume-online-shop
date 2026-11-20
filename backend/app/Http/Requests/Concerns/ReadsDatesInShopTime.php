<?php

namespace App\Http\Requests\Concerns;

use Carbon\Carbon;
use Throwable;

// The offers' dates are saved as shop time (Africa/Casablanca) without a time zone. A date
// that comes with its own zone, like "2026-11-30T23:00:00.000Z" from the admin's browser, is
// turned into shop time first, so the exact moment is kept. Saving it as it is would store
// the UTC clock time and read it back an hour off. Dates without a zone are left alone: they
// already are shop time.
trait ReadsDatesInShopTime
{
    // ends with "Z", or with an offset like "+01:00" or "-0500"
    private const HAS_TIME_ZONE = '/(Z|[+-]\d{2}:?\d{2})$/i';

    protected function prepareForValidation(): void
    {
        foreach (['starts_at', 'ends_at'] as $field) {
            $value = $this->input($field);

            if (! is_string($value) || ! preg_match(self::HAS_TIME_ZONE, trim($value))) {
                continue;
            }

            try {
                $shopTime = Carbon::parse(trim($value))->setTimezone(config('app.timezone'));
            } catch (Throwable) {
                continue; // not a date: the "date" rule answers with a clear error
            }

            $this->merge([$field => $shopTime->format('Y-m-d H:i:s')]);
        }
    }
}
