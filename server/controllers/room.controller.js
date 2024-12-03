const { model } = require("mongoose");
const Room = require("../models/room.model");

const getRoom = async (req, res) => {
  try {
    const rooms = await Room.find({}).populate('tenantId', 'name phone');
    res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
const getRoomById = async (req, res) => {
  const { id } = req.params;
  try {
    const room = await Room.findById(id).populate('tenantId', 'name phone');
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }
    res.status(200).json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRoomByHostelId = async (req, res) => {
  const { id } = req.params;
  try {
    const room = await Room.find({ hostelId: id }).populate('tenantId', 'name phone');
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }
    res.status(200).json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRoomByTenantId = async (req, res) => {
  const { id } = req.params;
  try {
    const room = await Room.find({ tenanId: id });
    console.log(id);
    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }
    res.status(200).json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const createRoom = async (req, res) => {
  const room = req.body;

  const Available = await Room.findOne({
    hostelId: room.hostelId,
    roomName: room.roomName,
  });

  if (
    !room.roomName ||
    !room.deposit ||
    !room.areacrage ||
    !room.elecIndex ||
    !room.aquaIndex ||
    !room.description
  ) {
    res
      .status(400)
      .json({ success: false, message: "Please provide all fields " });
  }
  if (Available) {
    res.status(400).json({ success: false, message: "Room is available!!" });
  }

  const newRoom = new Room(room);
  try {
    await newRoom.save();
    res.status(200).json({ success: true, data: newRoom });
  } catch (error) {
    console.error("Error in create new room", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  getRoomByHostelId,
  getRoom,
  getRoomById,
  getRoomByTenantId,
  createRoom,
};
