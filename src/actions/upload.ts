'use server'

import { uploadImage } from '@/lib/media'

export async function uploadToGigacore(formData: FormData, folder: string) {
  return uploadImage(formData, folder)
}
