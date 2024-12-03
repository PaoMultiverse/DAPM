const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { createBooking, getLandlordBooking, updateBookingStatus, getTenantBooking } = require('../controllers/booking.controller');
router.post('/create', 
  authMiddleware(['tenant']), 
  createBooking
);

router.get('/landlord', 
  authMiddleware(['landlord']), 
  getLandlordBooking
);

router.put('/:id/status', 
  authMiddleware(['landlord']), 
  updateBookingStatus
);

router.get('/tenant', 
  authMiddleware(['tenant']), 
  getTenantBooking
);

module.exports = router;