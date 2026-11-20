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
        // a name with only symbols has no slug, and a record without one has no URL.
        // the limit leaves room for the suffix in the 255 character column
        $base = rtrim(substr(Str::slug($name), 0, 240), '-') ?: Str::lower(class_basename($model));
        $slug = $base;
        $i = 2;

        while ($model::where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
