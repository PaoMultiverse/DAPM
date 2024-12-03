const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const Notification = require('../models/notification.model');

// Lấy danh sách thông báo của user
router.get('/', authMiddleware(['tenant', 'landlord']), async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      userId: req.user.id 
    })
    .sort({ createdAt: -1 });
    
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Đánh dấu thông báo đã đọc
router.patch('/:id/read', authMiddleware(['tenant', 'landlord']), async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router; 