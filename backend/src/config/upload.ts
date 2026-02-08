import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import ApiError from '../utils/ApiError';

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store in uploads directory
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname);
    const filename = `${uniqueId}${ext}`;
    cb(null, filename);
  },
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed image types
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  // Allowed file types for digital assets
  const allowedFileTypes = [
    ...allowedImageTypes,
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'video/mp4',
    'audio/mpeg',
  ];

  if (file.fieldname === 'image' || file.fieldname === 'images') {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Invalid image type. Only JPEG, PNG, GIF, and WebP are allowed'));
    }
  } else if (file.fieldname === 'digitalAsset') {
    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Invalid file type'));
    }
  } else {
    cb(null, true);
  }
};

// Multer upload instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
});

// Helper function to delete file
export const deleteFile = (filePath: string) => {
  const fs = require('fs');
  const fullPath = path.join(process.cwd(), filePath);
  
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

// Helper to get file URL
export const getFileUrl = (filename: string): string => {
  return `/uploads/${filename}`;
};
