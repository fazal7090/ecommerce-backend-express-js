// storage/index.js
import { CloudinaryStorage } from './adapter/cloudinaryStorage.js';

let _storage;
/** singleton */
export function getStorage() {
  if (_storage) return _storage;

  const provider = process.env.MEDIA_PROVIDER || 'cloudinary';

  if (provider === 'cloudinary') {
    _storage = new CloudinaryStorage({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      baseCdn: process.env.MEDIA_CDN_DOMAIN, // optional (e.g., img.example.com)
    });
  } 
   else {
    throw new Error(`Unsupported MEDIA_PROVIDER: ${provider}`);
  }

  return _storage;
}
