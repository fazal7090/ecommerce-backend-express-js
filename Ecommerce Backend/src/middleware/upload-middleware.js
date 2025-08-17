// middleware/uploads.js
import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed!'));
};

// add limits if you want: { fileSize: 5 * 1024 * 1024 }
export const uploads = multer({ storage, fileFilter });