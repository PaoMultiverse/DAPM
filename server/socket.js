const socketIO = require('socket.io');
const Message = require('./models/message.model');
const jwt = require('jsonwebtoken');

const setupSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: ["http://localhost:3000", "https://hostel-community.vercel.app"],
      methods: ["GET", "POST"],
      credentials: true,
    }
  });

  // Middleware xác thực Socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  // Quản lý kết nối socket của users
  const userSockets = new Map();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.userId);
    userSockets.set(socket.userId, socket.id);

    // Thông báo trạng thái online
    io.emit('user_status', {
      userId: socket.userId,
      status: 'online'
    });

    // X�� lý gửi tin nhắn
    socket.on("send_message", async (messageData) => {
      try {
        const { recipientId, content } = messageData;
        
        // Create new message
        const newMessage = new Message({
          senderId: socket.userId,
          recipientId: recipientId,
          content: content,
          timestamp: new Date(),
          read: false
        });

        // Save to database
        const savedMessage = await newMessage.save();
        
        // Populate recipient info
        const populatedMessage = await Message.findById(savedMessage._id)
          .populate('recipientId', 'name')
          .populate('senderId', 'name');

        // Emit to sender
        socket.emit('message_sent', {
          success: true,
          data: populatedMessage
        });

        // Emit to recipient if online
        const recipientSocketId = userSockets.get(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('receive_message', populatedMessage);
        }

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message_sent', {
          success: false,
          error: error.message
        });
      }
    });

    // Xử lý đánh dấu tin nhắn đã đọc
    socket.on("mark_messages_read", async (data) => {
      try {
        const { senderId } = data;
        
        // Cập nhật trạng thái đã đọc trong database
        await Message.updateMany(
          {
            recipientId: socket.userId,
            senderId: senderId,
            read: false
          },
          { read: true }
        );

        // Thông báo cho người gửi
        const senderSocketId = userSockets.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("messages_read_by_recipient", {
            readerId: socket.userId
          });
        }
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    // Xử lý disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId);
      userSockets.delete(socket.userId);
      
      // Thông báo trạng thái offline
      io.emit('user_status', {
        userId: socket.userId,
        status: 'offline'
      });
    });
  });

  return io;
};

module.exports = setupSocket; 