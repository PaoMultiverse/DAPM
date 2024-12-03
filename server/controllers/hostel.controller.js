const Hostel = require("../models/hostel.model");

//Lấy data của Hostel, thường dùng tạo danh sách
const getHostel = async (req, res) => {
  try {
    const hostels = await Hostel.find({});
    res.status(200).json({ success: true, data: hostels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
//Lấy data của Hostel theo id chỉ định, dùng để định hướng từ phòng này đến Hostel đang thuê
const getHostelById = async (req, res) => {
  const { id } = req.params;
  try {
    const hostel = await Hostel.findById(id);
    if (!hostel) {
      return res
        .status(404)
        .json({ success: false, message: "Hostel not found" });
    }
    res.status(200).json({ success: true, data: hostel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getHostelByUserId = async (req, res) => {
  const { id } = req.params;
  try {
    const hostel = await Hostel.find({ userId: id });
    console.log(id);
    if (!hostel) {
      return res
        .status(404)
        .json({ success: false, message: "Hostel not found" });
    }
    res.status(200).json({ success: true, data: hostel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
//Tạo Hostel
const createHostel = async (req, res) => {
  const hostel = req.body;
  console.log(req.file);
  if (!hostel.name || !hostel.address || !hostel.district || !hostel.city || !hostel.ward) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all fields" });
  }
  if (hostel.elecUnit < 0 || hostel.aqua < 0) {
    return res.status(400).json({
      success: false,
      message: "elecUnit,aquaUnit must not be less than 0",
    });
  }

  const findHostel = await Hostel.findOne({ name: hostel.name });

  if (findHostel) {
    return res
      .status(400)
      .json({ success: false, message: "Hostel is available" });
  }
  let imageUrl =
    "https://asset.cloudinary.com/cnpmnc/17da4fe9a04710f6b649531eef6c33e4"; // Ảnh mặc định
  if (req.file) {
    imageUrl = req.file.path; // Lấy URL của ảnh sau khi upload lên Cloudinary
  }

  const newHostel = new Hostel({
    name: hostel.name,
    address: hostel.address,
    district: hostel.district,
    city: hostel.city,
    ward: hostel.ward,
    imageUrl: imageUrl,
    userId: req.user.id,
  });

  try {
    await newHostel.save();
    res.status(200).json({ success: true, data: newHostel });
  } catch (error) {
    console.error("Error in register", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getHostel,
  createHostel,
  getHostelById,
  getHostelByUserId,
};
