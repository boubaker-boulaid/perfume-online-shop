<?php

namespace App\Services\Concerns;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

trait HandlesSlugsAndImages
{
    protected function storeImage(UploadedFile $image, string $folder)
    {
        return $image->store($folder, 'public');
    }

    protected function removeImage(?string $imagePath)
    {
        if ($imagePath) {
            Storage::disk('public')->delete($imagePath);
        }
    }

    // generate a slug from the name, adding a suffix (-2, -3...) when it's already taken
    protected function uniqueSlug(string $model, string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 2;

        while ($model::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }

        return $slug;
    }
}
