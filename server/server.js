const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const PORT = process.env.PORT || 5000;
require("dotenv").config();
const jwt = require("jsonwebtoken");

const Message = require("./models/message.model");
const bookingRoutes = require("./routes/booking.route");
const rentalRequestRoutes = require("./routes/rentalRequest.route");
const morgan = require("morgan");
const cors = require("cors");
const setupSocket = require("./socket");

const allowedOrigins = [
  "http://localhost:3000",
  "https://hostel-community.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Kiểm tra nếu origin không có (khi gọi từ chính server) hoặc thuộc allowedOrigins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      const msg =
        "The CORS policy for this site does not allow access from the specified origin.";
      return callback(new Error(msg), false);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));

// Khởi tạo Socket.IO với CORS config
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://hostel-community.vercel.app"],
    methods: ["GET", "POST", "PUT"],
    credentials: true,
  },
  path: "/socket.io",
});

// Socket Authentication Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

// Quản lý kết nối socket của users
const userSockets = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.userId);
  userSockets.set(socket.userId, socket.id);

  // Xử lý gửi tin nhắn
  socket.on("send_message", async (data) => {
    try {
      // Validate input data
      if (!data || !data.recipientId || !data.content) {
        throw new Error("Missing required message data");
      }

      const { recipientId, content } = data;

      const message = new Message({
        senderId: socket.userId,
        recipientId,
        content,
        timestamp: new Date(),
        read: false,
      });

      const savedMessage = await message.save();
      console.log("Message saved:", savedMessage);

      // Gửi tin nhắn đến người nhận nếu online
      const recipientSocketId = userSockets.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receive_message", {
          ...savedMessage.toObject(),
          senderName: socket.userId, // Thêm tên người gửi nếu cần
        });
      }

      // Gửi xác nhận về người gửi
      socket.emit("message_sent", {
        success: true,
        data: savedMessage,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("message_sent", {
        success: false,
        error: error.message,
      });
    }
  });

  // Xử lý đánh dấu tin nhắn đã đọc
  socket.on("mark_messages_read", async (data) => {
    try {
      console.log("Received mark_messages_read data:", data);

      // Validate input data
      if (!data || !data.senderId || !data.recipientId) {
        console.log("Invalid mark_messages_read data:", data);
        return;
      }

      const { senderId, recipientId } = data;

      console.log("Marking messages as read:", {
        recipientId: recipientId,
        senderId: senderId,
      });

      // Sửa lại query để match đúng tin nhắn cần đánh dấu
      const result = await Message.updateMany(
        {
          senderId: senderId, // Từ người gửi
          recipientId: recipientId, // Đến người nhận
          read: false, // Chỉ update những tin chưa đọc
        },
        {
          $set: { read: true },
        }
      );

      console.log("Messages marked as read result:", result);

      if (result.modifiedCount > 0) {
        // Thông báo cho người gửi biết tin nhắn đã được đọc
        const senderSocketId = userSockets.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("messages_read_by_recipient", {
            readerId: recipientId,
            timestamp: new Date(),
          });
        }

        // Emit event để cập nhật UI
        socket.emit("messages_marked_read", {
          senderId,
          recipientId,
          count: result.modifiedCount,
        });
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
      socket.emit("mark_messages_error", {
        error: error.message,
      });
    }
  });

  // Xử lý typing status
  socket.on("typing_start", ({ recipientId }) => {
    if (!recipientId) return;

    const recipientSocketId = userSockets.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("typing_status", {
        userId: socket.userId,
        isTyping: true,
      });
    }
  });

  socket.on("typing_end", ({ recipientId }) => {
    if (!recipientId) return;

    const recipientSocketId = userSockets.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("typing_status", {
        userId: socket.userId,
        isTyping: false,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId);
    userSockets.delete(socket.userId);

    // Thông báo cho tất cả users về trạng thái offline
    io.emit("user_status", {
      userId: socket.userId,
      status: "offline",
      timestamp: new Date(),
    });
  });
});

// Kết nối với database
const connectDB = require("./configs/db.js");
connectDB();

// Router
const hostelRoute = require("./routes/hostel.route.js");
const roomRoute = require("./routes/room.route.js");
const userRoute = require("./routes/user.route.js");
const authRoutes = require("./routes/auth.route");
const landlordRoute = require("./routes/landlord.route");
const messageRoute = require("./routes/message.route");
const notificationRouter = require('./routes/notification.routes');
const billRoutes = require('./routes/bill.routes');
const paymentRoutes = require('./routes/payment.routes');
// Api
app.use("/api/room", roomRoute);
app.use("/api/user", userRoute);
app.use("/api/auth", authRoutes);
app.use("/api/landlord", landlordRoute);
app.use("/api/messages", messageRoute);
app.use("/api/booking", bookingRoutes);
app.use("/api/rental-request", rentalRequestRoutes);
app.use('/api/notifications', notificationRouter);
app.use('/api/bills', billRoutes);
app.use('/api/payment', paymentRoutes);
server.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
