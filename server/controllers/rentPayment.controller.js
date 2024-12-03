const { paypalClient } = require("../configs/paypal");
const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");
const Bill = require("../models/bill.model");
const {
  vnpayConfig,
  createPaymentUrl,
  verifyReturnUrl,
} = require("../configs/vnpay");
const moment = require("moment");
const crypto = require("crypto");
const Notification = require("../models/notification.model");
const Room = require("../models/room.model");
// Hàm tạo thanh toán tiền thuê
exports.createRentPayment = async (req, res) => {
  const { rentFee, electricityFee, waterFee, serviceFee, billId } = req.body;

  // Tính tổng tiền (VND)
  const totalAmount = rentFee + electricityFee + waterFee + (serviceFee || 0);

  // Chuyển đổi VND sang USD (tạm tính 1 USD = 24,000 VND)
  const amountUSD = (totalAmount / 24000).toFixed(2);

  const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: amountUSD,
        },
        description: `Thanh toán hóa đơn #${billId}`,
      },
    ],
    application_context: {
      return_url: `${process.env.REACT_APP_API_URL}/payment/paypal/success?billId=${billId}`,
      cancel_url: `${process.env.CLIENT_URL}/tenant/bills?payment=cancelled`,
      brand_name: "Hostel Community",
      landing_page: "LOGIN",
      user_action: "PAY_NOW",
    },
  });

  try {
    const response = await paypalClient.execute(request);
    res.json({
      success: true,
      links: response.result.links,
    });
  } catch (error) {
    console.error("PayPal create payment error:", error);
    res.status(500).json({
      success: false,
      message: "Không thể tạo thanh toán PayPal",
    });
  }
};
exports.executeRentPayment = async (req, res) => {
  const { token, billId } = req.query;

  try {
    console.log("Processing payment for token:", token, "billId:", billId);

    if (!token || !billId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin thanh toán",
      });
    }

    // Kiểm tra bill tồn tại
    const bill = await Bill.findById(billId);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hóa đơn",
      });
    }

    // Kiểm tra trạng thái bill
    if (bill.status === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Hóa đơn đã được thanh toán",
      });
    }

    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(token);
    request.requestBody({});

    const capture = await paypalClient.execute(request);
    console.log("PayPal capture result:", capture.result);

    if (capture.result.status === "COMPLETED") {
      const updatedBill = await Bill.findByIdAndUpdate(
        billId,
        {
          status: "PAID",
          paymentMethod: "PAYPAL",
          paymentDate: new Date(),
          paypalTransactionId: capture.result.id,
        },
        { new: true }
      );
      return res.json({
        success: true,
        message: "Thanh toán thành công",
        data: updatedBill,
      });
    }
  } catch (error) {
    console.error("PayPal capture error:", error);

    // Kiểm tra nếu order đã được capture
    if (
      error.statusCode === 422 &&
      error._originalError?.text.includes("ORDER_ALREADY_CAPTURED")
    ) {
      // Cập nhật bill status
      const updatedBill = await Bill.findByIdAndUpdate(
        billId,
        {
          status: "PAID",
          paymentMethod: "PAYPAL",
          paymentDate: new Date(),
        },
        { new: true }
      );

      return res.json({
        success: true,
        message: "Thanh toán thành công",
        data: updatedBill,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Lỗi xử lý thanh toán",
      error: error.message,
    });
  }
};

// Thêm hàm xử lý VNPAY
exports.createVNPayPayment = async (req, res) => {
  const { billId } = req.body;

  try {
    const bill = await Bill.findById(billId);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hóa đơn",
      });
    }

    // Thêm kiểm tra trạng thái bill
    if (bill.status === "PROCESSING") {
      return res.status(400).json({
        success: false,
        message: "Hóa đơn đang được xử lý",
      });
    }

    // Thêm timeout cho request
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), 30000);
    });

    const paymentPromise = createPaymentUrl(
      billId,
      bill.totalAmount,
      `Thanh toan hoa don ${billId}`
    );

    const paymentUrl = await Promise.race([paymentPromise, timeoutPromise]);

    // Cập nhật trạng thái bill
    await Bill.findByIdAndUpdate(billId, {
      status: "PROCESSING",
      paymentMethod: "VNPAY",
    });

    res.json({
      success: true,
      paymentUrl,
    });
  } catch (error) {
    console.error("VNPAY payment error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi xử lý thanh toán: " + error.message,
    });
  }
};

// Thêm hàm xử lý callback từ VNPAY
exports.vnpayCallback = async (req, res) => {
  try {
    // Lấy params từ cả query và body
    const vnp_Params = { ...req.query, ...req.body };
    console.log("Received VNPAY callback params:", vnp_Params);

    const billId = vnp_Params.vnp_TxnRef;
    const responseCode = vnp_Params.vnp_ResponseCode;

    // Kiểm tra bill tồn tại
    const bill = await Bill.findById(billId);
    console.log("Found bill:", bill);

    if (!bill) {
      console.log("Bill not found:", billId);
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hóa đơn",
      });
    }

    if (responseCode === "00") {
      try {
        // Cập nhật trạng thái bill
        const updatedBill = await Bill.findOneAndUpdate(
          {
            _id: billId,
            status: { $in: ["PENDING", "PROCESSING"] },
          },
          {
            status: "PAID",
            paymentMethod: "VNPAY",
            paymentDate: new Date(),
            vnpayTransactionId: vnp_Params.vnp_TransactionNo,
          },
          {
            new: true,
            runValidators: true,
          }
        );
        const room = await Room.findByIdAndUpdate(updatedBill.roomId, {
          paymentStatus: "paid",
        });
        console.log(room);
        console.log("Updated bill:", updatedBill);

        if (!updatedBill) {
          throw new Error("Không thể cập nhật trạng thái hóa đơn");
        }

        return res.json({
          success: true,
          message: "Thanh toán thành công",
          data: updatedBill,
        });
      } catch (error) {
        console.error("Error updating bill:", error);
        return res.status(500).json({
          success: false,
          message: "Lỗi cập nhật trạng thái hóa đơn",
        });
      }
    } else {
      // Cập nhật lại trạng thái bill về PENDING
      await Bill.findByIdAndUpdate(billId, {
        status: "PENDING",
        paymentMethod: null,
      });

      return res.json({
        success: false,
        message: "Thanh toán thất bại",
        errorCode: responseCode,
      });
    }
  } catch (error) {
    console.error("VNPAY callback error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi xử lý thanh toán",
    });
  }
};

exports.createPaymentUrl = (orderId, amount, orderInfo, locale = "vn") => {
  // Format amount to integer
  const validAmount = Math.floor(Math.abs(amount)) * 100;

  const createDate = moment().format("YYYYMMDDHHmmss");

  const vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: exports.vnpayConfig.tmnCode,
    vnp_Locale: locale,
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId.toString(),
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "billpayment",
    vnp_Amount: validAmount,
    vnp_ReturnUrl: exports.vnpayConfig.returnUrl,
    vnp_IpAddr: "127.0.0.1",
    vnp_CreateDate: createDate,
    vnp_SecureHashType: "SHA512",
  };

  // Sort params alphabetically
  const sortedParams = {};
  Object.keys(vnp_Params)
    .sort()
    .forEach((key) => {
      if (
        vnp_Params[key] !== "" &&
        vnp_Params[key] !== null &&
        vnp_Params[key] !== undefined
      ) {
        sortedParams[key] = vnp_Params[key];
      }
    });

  // Create raw signature string (không encode URL, chỉ encode tiếng Việt)
  const signData = Object.entries(sortedParams)
    .map(([key, value]) => {
      // Encode toàn bộ giá trị, bao gồm cả khoảng trắng và ký tự đặc biệt
      const encodedValue = encodeURIComponent(value).replace(/%20/g, "+");
      return `${key}=${encodedValue}`;
    })
    .join("&");

  // Create hash
  const hmac = crypto.createHmac("sha512", exports.vnpayConfig.hashSecret);
  const signed = hmac.update(signData, "utf-8").digest("hex");

  // Add hash to params
  const finalParams = { ...sortedParams, vnp_SecureHash: signed };

  // Create final URL with proper encoding
  const queryString = Object.entries(finalParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const paymentUrl = `${exports.vnpayConfig.url}?${queryString}`;

  // Log for debugging
  console.log("Creating payment URL with params:", {
    orderId,
    amount,
    orderInfo,
    locale,
  });
  console.log("VNPAY Config:", {
    tmnCode: exports.vnpayConfig.tmnCode,
    hashSecret: exports.vnpayConfig.hashSecret,
    url: exports.vnpayConfig.url,
    returnUrl: exports.vnpayConfig.returnUrl,
  });
  console.log("Sorted params before signing:", sortedParams);
  console.log("Sign data:", signData);
  console.log("Generated hash:", signed);
  console.log("Final payment URL:", paymentUrl);

  return paymentUrl;
};

exports.verifyReturnUrl = (vnp_Params) => {
  try {
    const secureHash = vnp_Params["vnp_SecureHash"];

    // Tạo một object mới không bao gồm vnp_SecureHash
    const verifyParams = { ...vnp_Params };
    delete verifyParams["vnp_SecureHash"];
    delete verifyParams["vnp_SecureHashType"];

    // Sắp xếp các tham số theo thứ tự alphabet
    const sortedParams = {};
    Object.keys(verifyParams)
      .sort()
      .forEach((key) => {
        if (
          verifyParams[key] !== "" &&
          verifyParams[key] !== null &&
          verifyParams[key] !== undefined
        ) {
          sortedParams[key] = verifyParams[key];
        }
      });

    // Tạo chuỗi ký với encoding đúng
    const signData = Object.entries(sortedParams)
      .map(([key, value]) => {
        // Đảm bảo giá trị là string và encode đúng cách
        const encodedValue = encodeURIComponent(String(value)).replace(
          /%20/g,
          "+"
        );
        return `${key}=${encodedValue}`;
      })
      .join("&");

    // Tạo HMAC SHA512
    const hmac = crypto.createHmac("sha512", exports.vnpayConfig.hashSecret);
    const signed = hmac.update(signData, "utf-8").digest("hex");

    // So sánh chữ ký
    console.log("Verify process:", {
      receivedHash: secureHash,
      calculatedHash: signed,
      signData: signData,
      sortedParams: sortedParams,
    });

    return secureHash === signed;
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
};

exports.createVNPayUrl = async (req, res) => {
  try {
    const { billId, amount, orderDescription, language } = req.body;

    // Validate input
    if (!billId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin thanh toán",
      });
    }

    // Kiểm tra bill tồn tại và chưa thanh toán
    const bill = await Bill.findOne({
      _id: billId,
      status: "PENDING",
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hóa đơn hoặc hóa đơn đã được thanh toán",
      });
    }

    // Tạo thông tin thanh toán
    let date = new Date();
    let createDate = moment(date).format("YYYYMMDDHHmmss");
    let orderId = moment(date).format("HHmmss");
    let ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress;

    let tmnCode = process.env.VNP_TMN_CODE;
    let secretKey = process.env.VNP_HASH_SECRET;
    let vnpUrl = process.env.VNP_URL;
    let returnUrl = process.env.VNP_RETURN_URL;

    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Locale: language || "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: billId,
      vnp_OrderInfo: orderDescription || `Thanh toan hoa don ${billId}`,
      vnp_OrderType: "billpayment",
      vnp_Amount: amount,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    // Sắp xếp các tham số theo thứ tự a-z
    let querystring = require("qs");
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;

    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

    // Cập nhật trạng thái bill sang PROCESSING
    await Bill.findByIdAndUpdate(billId, {
      status: "PROCESSING",
      paymentMethod: "VNPAY",
    });

    return res.status(200).json({
      success: true,
      paymentUrl: vnpUrl,
    });
  } catch (error) {
    console.error("Create VNPAY URL error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể tạo URL thanh toán",
    });
  }
};
