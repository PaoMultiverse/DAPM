const Message = require('../models/Message');

const deleteConversation = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const currentUserId = req.user.id;

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin người nhận'
      });
    }

    // Thay vì xóa, chỉ đánh dấu tin nhắn là đã xóa cho người dùng hiện tại
    const result = await Message.updateMany(
      {
        $or: [
          { senderId: currentUserId, recipientId: recipientId },
          { senderId: recipientId, recipientId: currentUserId }
        ]
      },
      {
        $addToSet: { deletedFor: currentUserId } // Thêm ID người dùng vào mảng deletedFor
      }
    );

    console.log('Marked messages as deleted for user:', {
      currentUserId,
      recipientId,
      modifiedCount: result.modifiedCount
    });

    return res.status(200).json({
      success: true,
      message: 'Đã xóa tin nhắn thành công',
      data: {
        modifiedCount: result.modifiedCount
      }
    });

  } catch (error) {
    console.error('Error marking messages as deleted:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa tin nhắn',
      error: error.message
    });
  }
};

module.exports = {
  deleteConversation
}; 