const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomTitle: { type: String, required: true },
  roomName: { type: String, required: true },
  dateCreate: { type: Date, required: true, default: Date.now },
  deposit: { type: Number, required: true },
  area: { type: Number, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String }],
  status: {
    type: String,
    enum: ['available', 'occupied'],
    default: 'available'
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'unpaid'],
    default: 'unpaid'
  },
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
    required: true,
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  amenities: [{ type: String }],
  lastUpdated: { type: Date, default: Date.now },
  electricityUnitPrice: {
    type: Number,
    required: true,
    default: 0
  },
  waterUnitPrice: {
    type: Number,
    required: true,
    default: 0
  },
  initialElectricityReading: {
    type: Number,
    default: 0
  },
  initialWaterReading: {
    type: Number,
    default: 0
  }
});

roomSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model("Room", roomSchema);
