const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const billController = require("../controllers/bill.controller");
const Bill = require("../models/bill.model");
// Lấy lịch sử thanh toán
router.get(
  "/history",
  authMiddleware(["tenant"]),
  billController.getBillHistory
);

// Lấy danh sách hóa đơn của landlord
router.get(
  "/landlord/bills",
  authMiddleware(["landlord"]),
  billController.getLandlordBills
);

// Lấy danh sách hóa đơn đã thanh toán của landlord
router.get(
  "/landlord/paid-bills",
  authMiddleware(["landlord"]),
  billController.getLandlordPaidBills
);

// Lấy danh sách hóa đơn của tenant
router.get("/", authMiddleware(["tenant"]), async (req, res) => {
  try {
    const bills = await Bill.find({
      tenantId: req.user.id,
    })
      .populate({
        path: "roomId",
        select: "roomName",
      })
      .sort({ createdAt: -1 });

    if (!bills || bills.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Chưa có hóa đơn nào",
      });
    }

    res.json({ success: true, data: bills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Lấy chi tiết một hóa đơn của tenant
router.get("/:id", authMiddleware(["tenant"]), async (req, res) => {
  try {
    const bill = await Bill.findOne({
      _id: req.params.id,
      tenantId: req.user.id,
    }).populate({
      path: "roomId",
      select: "roomName",
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hóa đơn hoặc không có quyền truy cập",
      });
    }

    res.json({ success: true, data: bill });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
