<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\Storage;
use RuntimeException;

// the catalog seeders copy their images from seeders/assets to the public disk
trait CopiesSeedImages
{
    // $image is a path inside seeders/assets, like products/sauvage.webp
    // it is stored at the same path on the public disk: storage/app/public/products/sauvage.webp
    private function copyImage(string $image): string
    {
        $source = database_path('seeders/assets/'.$image);

        if (! is_file($source)) {
            throw new RuntimeException('seed image missing: '.$image);
        }

        Storage::disk('public')->put($image, file_get_contents($source));

        return $image;
    }
}
