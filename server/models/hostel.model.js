const mongoose = require("mongoose");
const hostelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  district: { type: String, required: true },
  city: { type: String, required: true },
  ward: { type: String,required: true,},
  elecUnit: { type: Number, required: true, default: 1 },
  aquaUnit: { type: Number, required: true, default: 1 },
  servicesFee: { type: Number, required: true, default: 0 },
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  imageUrl: { type: String, required: false },
});

// Sử dụng Virtual Populate để tạo trường rooms
hostelSchema.virtual("rooms", {
  ref: "Room", // Model liên kết
  localField: "_id", // Trường trong Hostel (hostelId trong Room)
  foreignField: "hostelId", // Trường trong Room liên kết tới Hostel
});

// Bật virtuals khi chuyển thành JSON hoặc Object
hostelSchema.set("toObject", { virtuals: true });
hostelSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model(`Hostel`, hostelSchema);
