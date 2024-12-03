const crypto = require("crypto");
const moment = require("moment");

exports.vnpayConfig = {
  tmnCode: process.env.VNPAY_TMCODE,
  hashSecret: process.env.VNPAY_HASHSECRET,
  url: process.env.VNPAY_URL,
  returnUrl: process.env.VNP_RETURN_URL,
};

exports.createPaymentUrl = (orderId, amount, orderInfo, locale = "vn") => {
  try {
    // Format date
    const date = new Date();
    const createDate = moment(date).format("YYYYMMDDHHmmss");

    // Ensure amount is positive integer
    const validAmount = Math.floor(Math.abs(amount)) * 100;

    // Create raw params
    const vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: exports.vnpayConfig.tmnCode,
      vnp_Locale: locale,
      vnp_CurrCode: "VND",
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: "billpayment",
      vnp_Amount: validAmount,
      vnp_ReturnUrl: exports.vnpayConfig.returnUrl,
      vnp_IpAddr: "127.0.0.1",
      vnp_CreateDate: createDate,
    };

    // Sort params
    const sortedParams = {};
    Object.keys(vnp_Params)
      .sort()
      .forEach((key) => {
        if (
          vnp_Params[key] !== "" &&
          vnp_Params[key] !== null &&
          vnp_Params[key] !== undefined
        ) {
          sortedParams[key] = String(vnp_Params[key]);
        }
      });

    // Create sign data with proper encoding
    const signData = Object.entries(sortedParams)
      .map(([key, value]) => {
        const encodedValue = encodeURIComponent(value).replace(/%20/g, "+");
        return `${key}=${encodedValue}`;
      })
      .join("&");

    // Create hash
    const hmac = crypto.createHmac("sha512", exports.vnpayConfig.hashSecret);
    const signed = hmac.update(signData, "utf-8").digest("hex");

    // Add hash to params
    const finalParams = { ...sortedParams, vnp_SecureHash: signed };

    // Create final URL
    const paymentUrl =
      `${exports.vnpayConfig.url}?` +
      Object.entries(finalParams)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&");

    return paymentUrl;
  } catch (error) {
    console.error("Error creating payment URL:", error);
    throw error;
  }
};

exports.verifyReturnUrl = (vnp_Params) => {
  try {
    const secureHash = vnp_Params["vnp_SecureHash"];

    // Create verify params
    const verifyParams = { ...vnp_Params };
    delete verifyParams["vnp_SecureHash"];
    delete verifyParams["vnp_SecureHashType"];

    // Sort params
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

    // Create sign data
    const signData = Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    // Create hash
    const hmac = crypto.createHmac("sha512", exports.vnpayConfig.hashSecret);
    const signed = hmac.update(signData, "utf-8").digest("hex");

    // Compare hashes
    return secureHash === signed;
  } catch (error) {
    console.error("Error verifying return URL:", error);
    return false;
  }
};
