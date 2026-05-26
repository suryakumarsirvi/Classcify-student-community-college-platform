import multer from 'multer';

const ALLOWED_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'video/mp4',
  'video/quicktime',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain'
];

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, and documents (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT) are allowed.'), false);
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 }
});

export default upload;
