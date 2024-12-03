const mongoose = require("mongoose");
const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  is_admin: { type: Number, required: true, default: 0 },
});

module.exports = mongoose.model(`Admin`, adminSchema);
