const jwt = require("jsonwebtoken");

const authMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    // Lấy token từ header
    const authHeader = req.header("Authorization");
    console.log(req.header("Authorization"));
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Không có token hoặc token không đúng định dạng",
      });
    }

    const token = authHeader.split(" ")[1]; // Lấy token sau "Bearer"

    try {
      // Xác thực token và trích xuất dữ liệu trong token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      console.log("Dữ liệu của token:", req.user);
      // Kiểm tra quyền hạn của user dựa trên role
      if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
        return res
          .status(403)
          .json({ success: false, message: "Không có quyền truy cập" });
      }

      // Tiếp tục quy trình
      next();
    } catch (error) {
      // Phân loại lỗi JWT
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ success: false, message: "Token đã hết hạn" });
      } else if (error.name === "JsonWebTokenError") {
        return res
          .status(401)
          .json({ success: false, message: "Token không hợp lệ" });
      } else {
        return res
          .status(500)
          .json({ success: false, message: "Lỗi xác thực token" });
      }
    }
  };
};

module.exports = authMiddleware;
