// lib/uploadToCloudinary.js
import { cloudinary } from './cloudinary.js';
import stream from 'stream';

export function uploadBufferToCloudinary(buffer, opts = {}) {
  // opts: { folder?: 'stores/123/products' }
  return new Promise((resolve, reject) => {
    const pass = new stream.PassThrough();
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: opts.folder || 'products',
        resource_type: 'image',
        use_filename: false,
        unique_filename: true,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result); // contains public_id, secure_url, width, height, bytes, format, etc.
      }
    );
    pass.end(buffer);
    pass.pipe(upload);
  });
}
