const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
    createRentalRequest,
    updateRentalRequestStatus,
    getLandlordRentalRequests
} = require('../controllers/rentalRequest.controller');

router.get('/landlord', authMiddleware(['landlord']), getLandlordRentalRequests);
router.post('/create', authMiddleware(['tenant']), createRentalRequest);
router.put('/:id/status', authMiddleware(['landlord']), updateRentalRequestStatus);

module.exports = router;
