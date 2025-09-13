// storage/adapters/cloudinaryStorage.js
import { v2 as cloudinary } from 'cloudinary';
import stream from 'stream';

export class CloudinaryStorage {
  /**
   * @param {{ cloud_name:string, api_key:string, api_secret:string }} cfg
   */
  constructor(cfg) {
    // setting up cloudinary instance with the provided configuration
    cloudinary.config({ ...cfg, secure: true });
  }

  async upload({ data, folder = 'products', contentType }) {
    
    const res = await new Promise((resolve, reject) => {
      const pass = new stream.PassThrough();
      //setting up the connection to cloudinary upload stream
      // ✅ callback must be the 2nd arg to upload_stream
      const up = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image', use_filename: false },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      // sending the data to cloudinary
      pass.pipe(up);  // connect the pipeline first
      pass.end(Buffer.isBuffer(data) ? data : Buffer.from(data))
    });

    return {
      id: res.public_id,
      url: res.secure_url,
      bytes: res.bytes,
      width: res.width,
      height: res.height,
      contentType,
    };
  }

  // cloudinary.uploader.destroy itself → only talks to Cloudinary and gives you { result: "ok" | "not found" | "error" }.
  // we can use the response in controller to generate a more meaningful message.
  async delete(id) {
   return await cloudinary.uploader.destroy(id, { resource_type: 'image' });
  }

  async getUrl(id, opts = {}) {
   
    const transformation = [];
    if (opts.width || opts.height) transformation.push({ width: opts.width, height: opts.height, crop: 'limit' });
    if (opts.format) transformation.push({ fetch_format: opts.format });
    return cloudinary.url(id, { secure: true, transformation });
  }


}


// cloudinary.uploader.upload_stream(opts, cb) creates a Writable stream (up) and remembers your callback cb.

// When you do pass.pipe(up), Node routes all chunks written to pass into up’s internal _write() method.

// When you call pass.end(buffer), Node:

// pushes the buffer through pass → into up,

// emits 'end' on pass and then 'finish' on up once all bytes are written.

// The Cloudinary stream implementation listens for those events and, on 'finish', finalizes the HTTP upload request.
// When Cloudinary responds (success or error), the SDK calls your cb(err, result). In your Promise, that triggers reject(err) or resolve(result).