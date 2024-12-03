const mongoose = require("mongoose");

const contractsSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  depositFee: {
    type: Number,
    required: true,
  },
  rentFee: {
    type: Number,
    required: true,
  },
  electricityFee: {
    type: Number,
    required: true,
  },
  waterFee: {
    type: Number,
    required: true,
  },

  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
  },
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Landlord",
    required: true,
  },
});
module.exports = mongoose.model("Contracts", contractsSchema);
