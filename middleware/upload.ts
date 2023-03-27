import multer from "fastify-multer";

function upload(fileSizeLimit: number) {
  const storage = multer.diskStorage({
    destination: (req, res, cb) => {
      cb(null, "public/");
    },
    filename: (req, file, cb) => {
      cb(null, `${Math.round(Math.random() * 7000000)}_${file.originalname}`);
    },
  });

  const limits = { fileSize: fileSizeLimit * 1000 * 1024 };

  return multer({ storage, limits });
}

export default upload;
