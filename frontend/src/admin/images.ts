// The backend accepts images up to 2 Mo ("max:2048", in kilobytes). PHP refuses bigger files
// before Laravel even sees them, and above 8 Mo it drops the whole form, so every field would
// say "obligatoire". Checking here first gives the admin the real reason, without uploading.
const MAX_IMAGE_BYTES = 2048 * 1024

export const IMAGE_TOO_BIG = 'L’image doit faire 2 Mo maximum. Réduisez-la, puis réessayez.'

// Leaves out an empty file input (no new image chosen: the old one stays). Gives back an error
// message when the chosen image is too big, or null when the form can be sent.
export function checkImage(form: FormData): string | null {
  const image = form.get('image')

  if (!(image instanceof File)) return null
  if (image.size === 0) {
    form.delete('image')
    return null
  }

  return image.size > MAX_IMAGE_BYTES ? IMAGE_TOO_BIG : null
}
