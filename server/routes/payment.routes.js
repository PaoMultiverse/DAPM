const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const rentController = require('../controllers/rentPayment.controller');

//Route tạo thanh toán  bằng paylpal 
router.post('/create-paypal',authMiddleware(["tenant"]),rentController.createRentPayment);
//Route xử lý callback từ paypal 
router.get('/paypal/success', authMiddleware(["tenant"]), rentController.executeRentPayment);
//Route xử lý callback khi người dùng hủy thanh toán
router.get('/paypal/cancel', (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/tenant/bills?payment=cancelled`);
});

// Route thanh toán VNPAY
router.post('/vnpay/create', authMiddleware(["tenant"]), rentController.createVNPayPayment);
router.get('/vnpay/callback', rentController.vnpayCallback);

// Route xử lý kết quả thanh toán
router.get('/payment-result', authMiddleware(["tenant"]), (req, res) => {
    const { vnp_ResponseCode, vnp_TxnRef } = req.query;
    if (vnp_ResponseCode === '00') {
        res.redirect(`${process.env.CLIENT_URL}/tenant/bills/payment-result?vnp_ResponseCode=${vnp_ResponseCode}&vnp_TxnRef=${vnp_TxnRef}`);
    } else {
        res.redirect(`${process.env.CLIENT_URL}/tenant/bills/payment-result?payment=failed&code=${vnp_ResponseCode}`);
    }
});

module.exports = router;
