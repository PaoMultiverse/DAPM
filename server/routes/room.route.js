const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");

const {
  getRoom,
  getRoomById,
  getRoomByHostelId,
  getRoomByTenantId,
  createRoom,
} = require("../controllers/room.controller");

const router = express.Router();

//Quản trị Admin
router.get("/", authMiddleware(["admin"]), getRoom);
router.get("/:id", authMiddleware(["admin"]), getRoomById);
//Quản trị
router.get(
  "/hostel/:id",
  authMiddleware(["admin", "landlord", "manager"]),
  getRoomByHostelId
);
//Quản lý phòng đang thuê (Tenant)
router.get("/tenant/:id", getRoomByTenantId);
//Đăng phòng (chỉ Landlord)
router.post("/", createRoom);

module.exports = router;
