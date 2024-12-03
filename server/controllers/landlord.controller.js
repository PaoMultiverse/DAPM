const Hostel = require("../models/hostel.model");
const Room = require("../models/room.model");
const Contract = require("../models/contracts.model");
const RentalRequest = require("../models/rentalRequest.model");
const UnitRoom = require("../models/unitRoom.model");
const Bill = require("../models/bill.model");
const Notification = require("../models/notification.model");
const User = require("../models/user.model");
const createHostel = async (req, res) => {
  const hostel = req.body;
  console.log(req.file);
  if (
    !hostel.name ||
    !hostel.address ||
    !hostel.district ||
    !hostel.city ||
    !hostel.ward
  ) {
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
    landlordId: hostel.landlordId,
  });
  try {
    await newHostel.save();
    res.status(200).json({ success: true, data: newHostel });
  } catch (error) {
    console.error("Error in register", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const createRoom = async (req, res) => {
  const { roomTitle, roomName, deposit, area, description, price } = req.body;
  const { hostelId } = req.params;

  if (!roomTitle || !roomName || !deposit || !area || !description || !price) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng điền đầy đủ thông tin",
    });
  }

  const hostel = await Hostel.findById(hostelId);
  if (!hostel) {
    return res.status(400).json({
      success: false,
      message: "Nhà trọ không tồn tại",
    });
  }

  const imagePaths = req.files.map((file) => file.path);

  try {
    const newRoom = new Room({
      roomTitle,
      roomName,
      deposit,
      area,
      description,
      price,
      images: imagePaths,
      hostelId: hostel._id,
      status: "available",
      paymentStatus: "unpaid",
    });

    await newRoom.save();
    res.status(200).json({ success: true, data: newRoom });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const createContract = async (req, res) => {
  const contract = req.body;
  console.log("Contract data received:", contract);

  // Kiểm tra các trường bắt buộc
  if (
    !contract.roomId ||
    !contract.tenantId ||
    !contract.startDate ||
    !contract.endDate ||
    !contract.depositFee ||
    !contract.rentFee ||
    !contract.electricityFee ||
    !contract.waterFee ||
    !contract.landlordId
  ) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng điền đầy đủ thông tin hợp đồng",
    });
  }

  // Kiểm tra giá trị số
  if (
    contract.electricityFee < 0 ||
    contract.waterFee < 0 ||
    contract.serviceFee < 0 ||
    contract.depositFee < 0 ||
    contract.rentFee < 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Các giá trị không được âm",
    });
  }

  try {
    // Kiểm tra phòng có tồn tại không
    const room = await Room.findById(contract.roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phòng",
      });
    }

    // Kiểm tra phòng đã có hợp đồng chưa
    const existingContract = await Contract.findOne({
      roomId: contract.roomId,
    });

    if (existingContract) {
      return res.status(400).json({
        success: false,
        message:
          "Phòng này đã có hợp đồng. Vui lòng kết thúc hợp đồng cũ trước khi tạo hợp đồng mới",
      });
    }

    const newContract = new Contract({
      roomId: contract.roomId,
      tenantId: contract.tenantId,
      landlordId: contract.landlordId,
      startDate: contract.startDate,
      endDate: contract.endDate,
      depositFee: contract.depositFee,
      rentFee: contract.rentFee,
      electricityFee: contract.electricityFee,
      waterFee: contract.waterFee,
    });

    const data = await newContract.save();

    // Cập nhật trạng thái phòng
    await Room.findByIdAndUpdate(contract.roomId, {
      status: "occupied",
      tenantId: contract.tenantId,
      contractId: newContract._id,
    });

    await newContract.save();

    // Cập nhật trạng thái phòng với { new: true } để trả về document đã update
    const updatedRoom = await Room.findByIdAndUpdate(
      contract.roomId,
      {
        $set: {
          status: "occupied",
          tenantId: contract.tenantId,
        },
      },
      { new: true }
    );

    console.log("Updated room:", updatedRoom); // Thêm log để kiểm tra

    if (!updatedRoom) {
      throw new Error("Không thể cập nhật thông tin phòng");
    }

    // Cập nhật rental request
    const updatedRequest = await RentalRequest.findOneAndUpdate(
      {
        roomId: contract.roomId,
        tenantId: contract.tenantId,
        status: "pending",
      },
      {
        status: "accepted",
        contractId: newContract._id,
      },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu thuê phòng",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        contract: newContract,
        room: updatedRoom,
      },
      message: "Tạo hợp đồng thành công",
    });
  } catch (error) {
    console.error("Create contract error:", error);
    res.status(500).json({
      success: false,
      message: "Không thể tạo hợp đồng: " + error.message,
    });
  }
};
const getHostelByLandLordId = async (req, res) => {
  const { landlordId } = req.query;
  console.log(landlordId);

  try {
    const hostel = await Hostel.find({ landlordId: landlordId });

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

const getHostelById = async (req, res) => {
  const { hostelId } = req.params;
  try {
    // Fetch the hostel and populate rooms
    const hostel = await Hostel.findById(hostelId).populate("rooms").lean();
    if (!hostel) {
      return res
        .status(400)
        .json({ success: false, message: "Hostel not found" });
    }

    // Fetch latest UnitRoom data for each room
    const roomsWithUnitData = await Promise.all(
      hostel.rooms.map(async (room) => {
        const latestUnitRoom = await UnitRoom.findOne({ roomId: room._id })
          .sort({ year: -1, month: -1 }) // Sort to get the latest entry
          .lean();

        return { ...room, latestUnitRoom }; // Combine room data with the latest UnitRoom data
      })
    );

    // Update hostel data with rooms that include UnitRoom info
    hostel.rooms = roomsWithUnitData;

    res.status(200).json({ success: true, data: hostel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRoomById = async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await Room.findById(roomId)
      .populate("hostelId")
      .populate("tenantId");

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phòng",
      });
    }

    // Format dữ liệu trả về
    const roomData = {
      _id: room._id,
      roomName: room.roomName,
      roomTitle: room.roomTitle,
      mainImage: room.images[0], // Lấy ảnh đầu tiên làm ảnh chính
      images: room.images,
      area: room.area,
      price: room.price,
      deposit: room.deposit,
      description: room.description,
      status: room.status,
      hostel: room.hostelId
        ? {
            name: room.hostelId.name,
            address: room.hostelId.address,
          }
        : null,
      tenant: room.tenantId
        ? {
            name: room.tenantId.name,
            phone: room.tenantId.phone,
            email: room.tenantId.email,
          }
        : null,
    };

    console.log("Room data:", roomData); // Debug log

    res.status(200).json({
      success: true,
      data: roomData,
    });
  } catch (error) {
    console.error("Error in getRoomById:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server: " + error.message,
    });
  }
};

const getTenantList = async (req, res) => {
  try {
    const landlordId = req.user.id;
    console.log("LandlordId from token:", landlordId);

    const hostels = await Hostel.find({ landlordId });
    console.log("Hostels found:", hostels.length);

    if (hostels.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Không tìm thấy cơ sở nào",
      });
    }

    const contracts = await Contract.find({
      landlordId: landlordId,
      endDate: { $gte: new Date() },
    })
      .populate({
        path: "tenantId",
        model: "User",
        select: "name email phone",
      })
      .populate({
        path: "roomId",
        model: "Room",
        select: "roomName hostelId",
        populate: {
          path: "hostelId",
          model: "Hostel",
          select: "name",
        },
      });

    console.log("Valid contracts found:", contracts.length);

    // Format dữ liệu trả về
    const tenants = contracts
      .map((contract) => {
        if (!contract.roomId?.hostelId || !contract.tenantId) {
          console.warn("Missing data for contract:", contract._id);
          return null;
        }

        return {
          _id: contract._id,
          name: contract.tenantId.name,
          email: contract.tenantId.email,
          phone: contract.tenantId.phone,
          facility: contract.roomId.hostelId.name,
          room: contract.roomId.roomName,
          startDate: contract.startDate,
          endDate: contract.endDate,
        };
      })
      .filter(Boolean);

    console.log("Final tenants list:", tenants);

    res.status(200).json({
      success: true,
      data: tenants,
    });
  } catch (error) {
    console.error("Error getting tenant list:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách khách thuê: " + error.message,
    });
  }
};
const updateUnit = async (req, res) => {
  const unit = req.body;
  const { roomId } = req.params;
  console.log(roomId);
  if (!unit.elecIndex || !unit.aquaIndex) {
    res
      .status(400)
      .json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" });
  }
  try {
    const room = await Room.findById(roomId);
    const currentDate = new Date();

    if (!room) {
      res.status(400).json({ success: false, message: "Không có phòng này" });
    }
    const oldUnit = await UnitRoom.findOne({
      roomId: roomId,
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
    });
    console.log(oldUnit);
    if (oldUnit) {
      const data = await UnitRoom.findOneAndUpdate(
        { _id: oldUnit.id },
        {
          elecIndex: unit.elecIndex,
          aquaIndex: unit.aquaIndex,
        }
      );
      return res.status(200).json({ success: true, data: data });
    }
    const newUnit = new UnitRoom({
      elecIndex: unit.elecIndex,
      aquaIndex: unit.aquaIndex,
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
      roomId: roomId,
    });
    const data = await newUnit.save();
    res.status(200).json({ success: true, data: data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const sampleBill = async (req, res) => {
  const { roomId } = req.params;
  console.log(roomId);
  try {
    // Kiểm tra hợp đồng
    const contract = await Contract.findOne({ roomId: roomId });
    if (!contract) {
      return res
        .status(400)
        .json({ success: false, message: "Phòng chưa có hợp đồng" });
    }

    // Lấy 2 tháng mới nhất
    const unitData = await UnitRoom.find({ roomId: roomId })
      .sort({ year: -1, month: -1 }) // Sắp xếp giảm dần theo năm và tháng
      .limit(2); // Chỉ lấy 2 bản ghi mới nhất

    if (!unitData || unitData.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy dữ liệu đơn vị" });
    }
    const data = {
      elecBill: "",
      waterBill: "",
    };
    console.log(unitData[1]);
    if (!unitData[0] || !unitData[1]) {
      return res.status(400).json({
        success: false,
        message:
          "Tìm chỉ số điện nước không thành công. Tạo hóa đơn yêu cầu có 2 chỉ số điện nước của 2 tháng liên tiếp",
      });
    }
    data.elecBill =
      (unitData[0].elecIndex - unitData[1].elecIndex) * contract.electricityFee;
    data.waterBill =
      (unitData[0].aquaIndex - unitData[1].aquaIndex) * contract.waterFee;
    res.status(200).json({ success: true, data: data });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi trong khi xử lý yêu cầu",
    });
  }
};
const createBill = async (req, res) => {
  const bill = req.body;
  const { roomId } = req.params;

  console.log(roomId);
  try {
    const contract = await Contract.findOne({ roomId: roomId });
    if (!contract) {
      return res
        .status(400)
        .json({ success: false, message: "Chưa có hợp đồng" });
    }

    const unitData = await UnitRoom.find({ roomId: roomId })
      .sort({ year: -1, month: -1 }) // Sắp xếp giảm dần theo năm và tháng
      .limit(2); // Chỉ lấy 2 bản ghi mới nhất

    if (!unitData || unitData.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy dữ liệu đơn vị" });
    }
    const newBill = new Bill({
      roomId: roomId,
      tenantId: contract.tenantId,
      rentFee: contract.rentFee,
      electricityFee: bill.elecBill,
      waterFee: bill.waterBill,
      serviceFee: bill.serviceFee,
      serviceFeeDescription: bill.serviceFeeDescription,
      totalAmount: bill.total + contract.rentFee,
      status: "PENDING",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const savedBill = await newBill.save();

    // Tạo thông báo
    const notification = await Notification.create({
      userId: contract.tenantId,
      title: "Hóa đơn mới",
      message: `Bạn có hóa đơn mới cần thanh toán. Tổng tiền: ${bill.total}đ`,
      type: "BILL",
      billId: savedBill._id,
    });

    // Trả về savedBill thay vì data
    res.status(200).json({
      success: true,
      data: savedBill,
      notification: notification,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Đã xảy ra lỗi" });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Kiểm tra roomId có hợp lệ không
    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu ID phòng",
        data: null,
      });
    }

    // Kiểm tra phòng có tồn tại không
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Phòng không tồn tại",
        data: null,
      });
    }

    // Kiểm tra xem phòng có đang được thuê không
    if (room.status === "occupied") {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa phòng đang có người thuê",
        data: null,
      });
    }

    // Xóa phòng
    await Room.findByIdAndDelete(roomId);

    return res.status(200).json({
      success: true,
      message: "Xóa phòng thành công",
      data: null,
    });
  } catch (error) {
    console.error("Delete room error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa phòng",
      error: error.message,
      data: null,
    });
  }
};

const deleteHostel = async (req, res) => {
  const { hostelId } = req.params;

  try {
    // Kiểm tra cơ sở có tồn tại không
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Cơ sở không tồn tại",
      });
    }

    // Kiểm tra xem có phòng nào trong cơ sở không
    const rooms = await Room.find({ hostelId: hostelId });
    if (rooms.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa cơ sở còn phòng",
      });
    }

    // Xóa cơ sở
    await Hostel.findByIdAndDelete(hostelId);

    res.status(200).json({
      success: true,
      message: "Xóa cơ sở thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getHostelByLandLordId,
  createHostel,
  getHostelById,
  getRoomById,
  createRoom,
  createContract,
  getTenantList,
  updateUnit,
  sampleBill,
  createBill,
  deleteRoom,
  deleteHostel,
};
