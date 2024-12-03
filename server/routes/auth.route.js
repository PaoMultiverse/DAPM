const express = require("express");
const router = express.Router();
const {
  createUser,
  loginUser,
  verifyOTP,
  resendOtp,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");
const upload = require("../middlewares/uploadImage");
router.post("/register", upload.single("image"), createUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
