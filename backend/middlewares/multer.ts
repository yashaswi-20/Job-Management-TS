import multer from 'multer';

// Store file in memory to convert to Data URI before uploading to Cloudinary
const storage = multer.memoryStorage();

export const singleUpload = multer({ storage }).single("file");
