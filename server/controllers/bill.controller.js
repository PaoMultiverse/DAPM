const Bill = require('../models/bill.model');
const User = require('../models/user.model');

exports.getBillHistory = async (req, res) => {
    try {
        // Lấy bills của tenant dựa trên userId từ token
        const bills = await Bill.find({ 
            tenantId: req.user.id 
        })
        .populate({
            path: 'roomId',
            select: 'roomName'
        })
        .sort({ createdAt: -1 });

        // Trả về dữ liệu
        return res.status(200).json({
            success: true,
            data: bills,
            message: 'Lấy lịch sử hóa đơn thành công'
        });

    } catch (error) {
        console.error('Get bill history error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy lịch sử hóa đơn'
        });
    }
}; 

exports.getLandlordBills = async (req, res) => {
    try {
        const landlordId = req.user.id;
        
        const bills = await Bill.find()
            .populate({
                path: 'roomId',
                select: 'roomName hostelId',
                populate: {
                    path: 'hostelId',
                    select: 'name',
                    match: { landlordId: landlordId }
                }
            })
            .populate('tenantId', 'name')
            .sort({ createdAt: -1 });

        // Lọc bills chỉ lấy những bill thuộc về hostel của landlord
        const filteredBills = bills.filter(bill => 
            bill.roomId && bill.roomId.hostelId
        );

        res.status(200).json({
            success: true,
            data: filteredBills
        });

    } catch (error) {
        console.error('Get landlord bills error:', error);
        res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách hóa đơn"
        });
    }
};

exports.getLandlordPaidBills = async (req, res) => {
    try {
        const landlordId = req.user.id;

        const paidBills = await Bill.find({
            status: 'PAID'
        })
        .populate({
            path: 'roomId',
            select: 'roomName hostelId',
            populate: {
                path: 'hostelId',
                select: 'name',
                match: { landlordId: landlordId }
            }
        })
        .sort({ paymentDate: -1 });

        // Lọc bills chỉ lấy những bill thuộc về hostel của landlord
        const filteredBills = paidBills.filter(bill => 
            bill.roomId && bill.roomId.hostelId
        );

        res.status(200).json({
            success: true,
            data: filteredBills
        });

    } catch (error) {
        console.error('Get landlord paid bills error:', error);
        res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách hóa đơn đã thanh toán"
        });
    }
};