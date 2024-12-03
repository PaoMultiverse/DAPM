const multer = require("multer");
const cloudinary = require("../configs/cloudinary.config");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const getUploadFolder = (req) => {
  if (req.originalUrl.includes("/auth")) {
    return "uploads/auth";
  } else if (req.originalUrl.includes("/landlord/hostel")) {
    return "uploads/hostels";
  } else if (req.originalUrl.includes("landlord/room")) {
    return "uploads/rooms";
  }
  return "uploads/others";
};

// Cấu hình Cloudinary storage cho Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: getUploadFolder(req), // Thay đổi folder dựa trên yêu cầu
      format: "jpeg", // Định dạng ảnh
      public_id: file.originalname, // Tên file trên Cloudinary
    };
  },
});

// Khởi tạo Multer với Cloudinary storage
const upload = multer({ storage: storage });

module.exports = upload;
