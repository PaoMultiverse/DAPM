const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

// Khởi tạo môi trường sandbox PayPal
const environment = new checkoutNodeJssdk.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
);

const paypalClient = new checkoutNodeJssdk.core.PayPalHttpClient(environment);

console.log("PayPal Server Config:", {
  clientId: process.env.PAYPAL_CLIENT_ID,
  hasSecret: !!process.env.PAYPAL_CLIENT_SECRET
});

module.exports = { paypalClient };
