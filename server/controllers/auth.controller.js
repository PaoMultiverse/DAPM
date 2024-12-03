const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendverificationCode = require("../middlewares/sendEmail");

//Đăng ký, tạo user
const createUser = async (req, res) => {
  const user = req.body;

  if (
    !user ||
    !user.email ||
    !user.name ||
    !user.numPhone ||
    !user.gender ||
    !user.password
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Vui lòng điền đủ thông tin" });
  }
  let email = user.email.toLowerCase();
  if (user.numPhone.length !== 10) {
    return res
      .status(400)
      .json({ success: false, message: "Số điện thoại phải có 10 chữ số" });
  }

  const isAvailable = await User.findOne({ email: email });

  if (isAvailable && isAvailable.is_verified) {
    return res
      .status(400)
      .json({ success: false, message: "Tài khoản đã tồn tại" });
  }

  if (isAvailable && !isAvailable.is_verified) {
    await User.findOneAndDelete({ email: isAvailable.email });
  }

  const hashPassword = await bcrypt.hash(user.password, 10);
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  const otpExpires = new Date(Date.now() + 60 * 1000);
  // Xử lý ảnh upload
  let imageUrl =
    "https://asset.cloudinary.com/cnpmnc/17da4fe9a04710f6b649531eef6c33e4"; // Ảnh mặc định
  if (req.file) {
    imageUrl = req.file.path; // Lấy URL của ảnh sau khi upload lên Cloudinary
  }

  const newUser = new User({
    email: email,
    name: user.name,
    numPhone: user.numPhone,
    role: user.role,
    password: hashPassword,
    otpVerification: verificationCode,
    otpExpires: otpExpires,
    is_active: true,
    gender: user.gender,
    imageUrl: imageUrl,
    landlordId: user.landlordId,
  });
  try {
    await newUser.save();
    sendverificationCode(user.email, verificationCode);
    res.status(200).json({ success: true, data: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//Đăng nhập
const loginUser = async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  let emailLowCase = email.toLowerCase();
  console.log(emailLowCase);
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide both email and password",
    });
  }

  try {
    const user = await User.findOne({ email: emailLowCase });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Tài khoản không tồn tại" });
    }
    if (user.is_verified === false) {
      return res
        .status(404)
        .json({ success: false, message: "Email chưa được xác thực" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(404).json({
        success: false,
        message: "tài khoản hoặc mặt khẩu không chính xác",
      });
    }
    if (user.is_active === false) {
      return res
        .status(404)
        .json({ success: false, message: "Tài khoản chưa được kích hoạt" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({
      success: true,
      token,
      message: "Login successful",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
//Quên mật khẩu
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    //Tìm user với email
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email không tồn tại trong hệ thống",
      });
    }
    //Tạo mã OTP mới
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const otpExpires = new Date(Date.now() + 60 * 1000); //10 phút
    //Cập nhật OTP mới vào database
    await User.findByIdAndUpdate(user._id, {
      otpVerification: verificationCode,
      otpExpires: otpExpires,
      is_verified: false,
    });

    //Gửi email chứa mã OTP
    sendverificationCode(email, verificationCode);

    res.status(200).json({
      success: true,
      message: "Mã xác thực đã được gửi đến email của bạn ",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server" + error.message,
    });
  }
};
const resetPassword = async (req, res) => {
  const { email, newPassword, verifyOTP } = req.body;

  try {
    // Tìm user với email và OTP hợp lệ
    const user = await User.findOne({
      email: email,
      is_verified: true,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Không thể đặt lại mật khẩu. Vui lòng thử lại",
      });
    }

    // Hash mật khẩu mới
    const hashPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu và xóa OTP
    await User.findByIdAndUpdate(user._id, {
      password: hashPassword,
      $unset: { otpVerification: "", otpExpires: "" },
    });

    return res.status(200).json({
      success: true,
      message: "Đặt lại mật khẩu thành công",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi server: " + error.message,
    });
  }
};
//Xác thực Email OTP
const verifyOTP = async (req, res) => {
  const { email, verifyOTP } = req.body;
  try {
    const user = await User.findOne({
      email: email,
      otpVerification: verifyOTP,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Mã OTP không chính xác hoặc đã hết hạn",
      });
    }

    // Cập nhật trạng thái xác thực
    await User.findByIdAndUpdate(user._id, {
      is_verified: true,
    });

    return res.status(200).json({
      success: true,
      message: "Xác thực OTP thành công",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi server: " + error.message,
    });
  }
};

const resendOtp = async (req, res) => {
  const { email } = req.body;
  console.log(`data gửi về:`, req.body);
  console.log(email);
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  const otpExpires = new Date(Date.now() + 60 * 1000);
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Tài khoản không tồn tại" });
    }

    await User.findByIdAndUpdate(user.id, {
      otpVerification: verificationCode,
      otpExpires: otpExpires,
    });
  } catch (error) {}
  sendverificationCode(email, verificationCode);
};

module.exports = {
  createUser,
  loginUser,
  verifyOTP,
  resendOtp,
  forgotPassword,
  resetPassword,
};
