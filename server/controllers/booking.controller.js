const Booking = require('../models/booking.model');
const Room = require('../models/room.model');
const User = require('../models/user.model');
const { validateBookingTime } = require('../utils/bookingValidation');

exports.createBooking = async (req, res) => {
  try {
    const { roomId, landlordId, proposedDate, alternativeDate, message } = req.body;
    const tenantId = req.user.id;

    // Validate thời gian đặt lịch
    const timeValidation = validateBookingTime(proposedDate);
    if (!timeValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: timeValidation.message
      });
    }

    // Kiểm tra số lượng booking pending
    const pendingBookings = await Booking.find({
      tenantId,
      status: 'pending',
      proposedDate: { $gte: new Date() }
    });

    if (pendingBookings.length >= 5) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã có 5 lịch xem phòng đang chờ duyệt"
      });
    }

    // Kiểm tra booking trùng phòng
    const existingBooking = await Booking.findOne({
      tenantId,
      roomId,
      status: 'pending',
      proposedDate: { $gte: new Date() }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã có lịch xem phòng này đang chờ duyệt"
      });
    }

    // Kiểm tra phòng có tồn tại
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phòng"
      });
    }

    // Kiểm tra phòng có đang trống không
    if (room.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: "Phòng này hiện không còn trống"
      });
    }

    // Kiểm tra landlord có tồn tại
    const landlord = await User.findById(landlordId);
    if (!landlord || landlord.role !== 'landlord') {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chủ trọ"
      });
    }

    // Tạo booking mới
    const newBooking = new Booking({
      roomId,
      tenantId,
      landlordId,
      proposedDate,
      alternativeDate,
      message,
      status: 'pending'
    });

    await newBooking.save();

    // Có thể thêm logic gửi thông báo cho landlord ở đây

    res.status(201).json({
      success: true,
      data: newBooking,
      message: "Đã gửi yêu cầu xem phòng thành công"
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: "Không thể tạo lịch xem phòng"
    });
  }
};

exports.getLandlordBooking = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const bookings = await Booking.find({ landlordId })
      .populate({
        path: 'roomId',
        select: 'roomName roomTitle hostelId area description price',
        populate: {
          path: 'hostelId',
          select: 'name address city district ward'
        }
      })
      .populate('tenantId', 'name email numPhone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách đặt lịch"
    });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch đặt"
      });
    }

    // Kiểm tra thời gian hủy/từ chối (24h trước)
    if (status === 'rejected') {
      const bookingDate = new Date(booking.proposedDate);
      const now = new Date();
      const hoursDiff = (bookingDate - now) / (1000 * 60 * 60);

      if (hoursDiff < 24) {
        return res.status(400).json({
          success: false,
          message: "Chỉ có thể từ chối lịch xem phòng trước 24 giờ"
        });
      }
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
      message: `Đã ${status === 'accepted' ? 'chấp nhận' : 'từ chối'} lịch xem phòng`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể cập nhật trạng thái"
    });
  }
};

exports.getTenantBooking = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const bookings = await Booking.find({ tenantId })
      .populate('roomId')
      .populate('landlordId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách đặt lịch"
    });
  }
};

exports.getTenantBookings = async (req, res) => {
  try {
    const tenantId = req.user.id;
    
    const bookings = await Booking.find({ tenantId })
      .populate('roomId', 'roomName roomTitle price')
      .populate('landlordId', 'name email phone')
      .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo mới nhất

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách đặt lịch"
    });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.id;

    const booking = await Booking.findOne({ _id: id, tenantId });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch đặt"
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể hủy lịch đang chờ duyệt"
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Đã hủy lịch xem phòng"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể hủy lịch"
    });
  }
};