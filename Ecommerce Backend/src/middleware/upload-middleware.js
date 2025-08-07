import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure where to store images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // first arg is for error, second is for the destination
    // we will use first arg as new Error in case some condition fails
    cb(null, uploadDir); // folder to store uploaded images
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

// cb() is used twice — once in each of Multer’s internal steps

// Each call to cb() is context-specific:

// One for path (destination)

// One for name (filename)

// File filter: allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    // minmetype checks the type of file uploaded , like it will be image/ for all the types of images
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

//Multer returns a middleware function that processes the incoming request and handles file uploads
// Wew have assigned how multer will handle file uploads and which files it will accept
const uploads = multer({ storage, fileFilter });

export { uploads };