const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();
const {
  createHostel,
  getHostelByLandLordId,
  getHostelById,
  getRoomById,
  createRoom,
  createContract,
  updateUnit,
  getTenantList,
  sampleBill,
  createBill,
  deleteRoom,
  deleteHostel,
} = require("../controllers/landlord.controller");
const upload = require("../middlewares/uploadImage");

router.get("/hostel", authMiddleware(["landlord"]), getHostelByLandLordId);

router.get("/hostel/:hostelId", getHostelById);
router.post(
  "/hostel/create",
  authMiddleware(["landlord"]),
  upload.single("image"),
  createHostel
);
router.post("/contract/create", authMiddleware(["landlord"]), createContract);
router.get("/hostel/:roomId", getRoomById);
// router.get("/hostel/:roomId/update", );
router.post("/hostel/:roomId/updateUnit", updateUnit);
router.post("/hostel/:roomId/createBill", createBill);
router.post("/:roomId/sampleBill", sampleBill);
//Đăng cơ sở (chỉ landlord)
router.post(
  "/room/:hostelId/create",
  authMiddleware(["landlord"]),
  upload.array("images", 5), // Cho phép tải lên tối đa 5 ảnh
  createRoom
);
//Tạo tài khoản Manager (chỉ Landlord làm được)
// router.post("/manager/create", authMiddleware(["landlord"]));

router.get("/tenant-list", authMiddleware(["landlord"]), getTenantList);
router.delete("/room/:roomId/delete", authMiddleware(["landlord"]), deleteRoom);
router.delete(
  "/hostel/:hostelId/delete",
  authMiddleware(["landlord"]),
  deleteHostel
);

module.exports = router;
