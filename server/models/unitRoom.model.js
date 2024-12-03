const mongoose = require("mongoose");

const unitRoomSchema = new mongoose.Schema({
  elecIndex: { type: Number, required: true, default: 0 },
  aquaIndex: { type: Number, required: true, default: 0 },
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
});

module.exports = mongoose.model("UnitRoom", unitRoomSchema);
