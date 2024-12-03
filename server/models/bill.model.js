const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
  },
  rentFee: { type: Number, required: true },
  electricityFee: { type: Number, required: true },
  waterFee: { type: Number, required: true },
  serviceFee: { type: Number, default: 0 },
  serviceFeeDescription: { type: String, required: false },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'OVERDUE'],
    default: 'PENDING'
  },
  dueDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  paymentMethod: {
    type: String,
    enum: ['VNPAY', 'PAYPAL', 'BANK_TRANSFER'],
  },
  paymentDate: Date,
  paypalTransactionId: String
}, {
  timestamps: true
});

module.exports = mongoose.model("Bill", billSchema);
