const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const User = require("../models/user.model");

const {
  getUser,
  getUserByRole,
  updateActive,
  updateUser,
  changePassword,
  searchAccommodation,
  getAllRooms,
  getUserById,
  getTenantContracts,
} = require("../controllers/user.controller");
// Lấy danh sách phòng cho tenant
router.get("/rooms", authMiddleware(["tenant"]), getAllRooms);

// Tìm kiếm phòng trọ
router.get("/search", authMiddleware(["tenant"]), searchAccommodation);

// Lấy thông tin người dùng
router.get("/", authMiddleware(["tenant", "landlord", "manager"]), getUser);

// Lấy thông tin người dùng theo Id
router.get(
  "/:id",
  authMiddleware(["tenant", "landlord", "manager"]),
  getUserById
);

// Lấy người dùng theo role
router.get("/role/:role", authMiddleware(["manager"]), getUserByRole);

// Cập nhật trạng thái active của user
router.put("/active/:id", authMiddleware(["manager"]), updateActive);

// Cập nhật thông tin user
router.put(
  "/update",
  authMiddleware(["tenant", "landlord", "manager"]),
  updateUser
);

// Đổi mật khẩu
router.put(
  "/change-password",
  authMiddleware(["tenant", "landlord", "manager"]),
  changePassword
);
//Lấy user hiện tại 
router.get(
  "/current",
  authMiddleware(["tenant", "landlord", "manager"]),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      res.json({ success: true, data: user });
    } catch (error) {
      console.error("Error getting current user:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Lấy hợp đồng của tenant
router.get('/tenant/contracts', authMiddleware(['tenant']), getTenantContracts);

module.exports = router;
