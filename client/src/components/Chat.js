import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Avatar,
  IconButton,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import { ChatIcon, CloseIcon, DeleteIcon, MinusIcon } from "@chakra-ui/icons";
import io from "socket.io-client";
import axios from "axios";
import socket from "../services/socket";

const Chat = ({ currentUserId, recipientId, recipientName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const toast = useToast();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();

  useEffect(() => {
    if (!socket.connected) {
      socket.auth = { token: localStorage.getItem("token") };
      socket.connect();
    }

    // Đánh dấu tin nhắn đã đọc khi mở chat
    const markMessagesAsRead = () => {
      if (recipientId && currentUserId) {
        console.log("Marking messages as read:", {
          senderId: recipientId,
          recipientId: currentUserId,
        });

        socket.emit("mark_messages_read", {
          senderId: recipientId,
          recipientId: currentUserId,
        });
      }
    };

    // Đánh dấu đã đọc khi component mount
    markMessagesAsRead();

    // Lắng nghe tin nhắn mới
    socket.on("receive_message", (message) => {
      console.log("Received message:", message);
      if (message.senderId === recipientId) {
        setMessages((prev) => [...prev, message]);
        // Đánh dấu đã đọc ngay khi nhận tin nhắn mới
        markMessagesAsRead();
        scrollToBottom();
      }
    });

    // Lắng nghe kết quả đánh dấu đã đọc
    socket.on("messages_marked_read", (result) => {
      console.log("Messages marked as read:", result);
      // Cập nhật UI nếu cần
    });

    socket.on("mark_messages_error", (error) => {
      console.error("Error marking messages:", error);
      toast({
        title: "Lỗi",
        description: "Không thể đánh dấu tin nhắn đã đọc",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    });

    return () => {
      socket.off("receive_message");
      socket.off("messages_marked_read");
      socket.off("mark_messages_error");
    };
  }, [currentUserId, recipientId, toast]);

  // Fetch message history
  useEffect(() => {
    const fetchMessages = async () => {
      if (!recipientId || !currentUserId) return;

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API}/messages/history/${recipientId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setMessages(response.data.data);
        scrollToBottom();

        // Đánh dấu đã đọc sau khi load history
        socket.emit("mark_messages_read", {
          senderId: recipientId,
          recipientId: currentUserId,
        });
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải tin nhắn",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    if (recipientId && currentUserId) {
      fetchMessages();
    }
  }, [recipientId, currentUserId, toast]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    // Tạo message object
    const messageData = {
      recipientId,
      content: newMessage.trim(),
    };

    // Emit socket event
    socket.emit("send_message", messageData);

    // Thêm tin nhắn vào state messages ngay lập tức cho người gửi
    const tempMessage = {
      senderId: currentUserId,
      recipientId: recipientId,
      content: newMessage.trim(),
      timestamp: new Date(),
      read: false,
    };
    setMessages((prev) => [...prev, tempMessage]);

    // Clear input
    setNewMessage("");
    scrollToBottom();
  };

  // Thêm socket listener để xác nhận tin nhắn đã được gửi
  useEffect(() => {
    socket.on("message_sent", (response) => {
      if (!response.success) {
        toast({
          title: "Lỗi",
          description: "Không thể gửi tin nhắn. Vui lòng thử lại.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    });

    return () => {
      socket.off("message_sent");
    };
  }, [toast]);

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API}/messages/delete-conversation`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          data: {
            recipientId: recipientId,
          },
        }
      );

      if (response.data.success) {
        setMessages([]);
        toast({
          title: "Thành công",
          description: "Đã xóa tin nhắn",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onModalClose();
        onClose(); // Đóng chat box

        // Emit event để cập nhật MessageManagement
        socket.emit("conversation_deleted", {
          recipientId: recipientId,
        });
      }
    } catch (error) {
      console.error("Error deleting messages:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa tin nhắn",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteClick = () => {
    onModalOpen();
  };

  return (
    <>
      <Box
        position="fixed"
        bottom="20px"
        right="20px"
        width="1000px"
        height="400px"
        bg="white"
        borderRadius="lg"
        boxShadow="xl"
        zIndex={1000}
      >
        <HStack p={3} bg="blue.500" color="white" justify="space-between">
          <Text fontWeight="bold">{recipientName}</Text>
          <HStack>
            <IconButton
              icon={<DeleteIcon />}
              size="sm"
              variant="ghost"
              color="white"
              onClick={handleDeleteClick}
              title="Xóa cuộc trò chuyện"
            />
            <IconButton
              icon={<CloseIcon />}
              size="sm"
              variant="ghost"
              color="white"
              onClick={onClose}
              title="Đóng chat"
            />
          </HStack>
        </HStack>

        <VStack height="300px" overflowY="auto" p={4} spacing={4}>
          {messages.map((msg, index) => (
            <HStack
              key={index}
              w="100%"
              justify={
                msg.senderId === currentUserId ? "flex-end" : "flex-start"
              }
            >
              {msg.senderId !== currentUserId && (
                <Avatar size="sm" name={recipientName} />
              )}
              <Box
                maxW="70%"
                bg={msg.senderId === currentUserId ? "blue.500" : "gray.100"}
                color={msg.senderId === currentUserId ? "white" : "black"}
                p={2}
                borderRadius="lg"
              >
                <Text>{msg.content}</Text>
                <Text fontSize="xs" opacity={0.8}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </Text>
              </Box>
            </HStack>
          ))}
          <div ref={messagesEndRef} />
        </VStack>

        <HStack p={3} bg="gray.50">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button colorScheme="blue" onClick={sendMessage}>
            Gửi
          </Button>
        </HStack>
      </Box>

      <Modal isOpen={isModalOpen} onClose={onModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Xác nhận xóa</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Bạn có chắc chắn muốn xóa toàn bộ tin nhắn với {recipientName}?
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={handleDeleteConfirm}>
              Xóa
            </Button>
            <Button variant="ghost" onClick={onModalClose}>
              Hủy
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Chat;
