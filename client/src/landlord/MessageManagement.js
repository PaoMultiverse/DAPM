import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  useToast,
  Flex,
  Badge,
} from "@chakra-ui/react";
import axios from "axios";
import Chat from "../components/Chat";
import { jwtDecode } from "jwt-decode";
import socket from "../services/socket";

const MessageManagement = () => {
  const [allMessages, setAllMessages] = useState([]); // Tất cả tin nhắn
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const toast = useToast();

  // Fetch tất cả tin nhắn và nhóm theo người gửi
  const fetchAllMessages = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        `${process.env.REACT_APP_API}/messages/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Group messages by sender
      const groupedMessages = {};
      response.data.data.forEach((message) => {
        const senderId = message.senderId._id;
        if (!groupedMessages[senderId]) {
          groupedMessages[senderId] = {
            sender: message.senderId,
            messages: [],
            lastMessage: message,
            unreadCount: message.read ? 0 : 1,
          };
        } else {
          if (!message.read) {
            groupedMessages[senderId].unreadCount++;
          }
        }
        groupedMessages[senderId].messages.push(message);
        if (
          new Date(message.timestamp) >
          new Date(groupedMessages[senderId].lastMessage.timestamp)
        ) {
          groupedMessages[senderId].lastMessage = message;
        }
      });

      // Convert to array and sort
      const sortedConversations = Object.values(groupedMessages).sort(
        (a, b) => {
          if (a.unreadCount !== b.unreadCount) {
            return b.unreadCount - a.unreadCount;
          }
          return (
            new Date(b.lastMessage.timestamp) -
            new Date(a.lastMessage.timestamp)
          );
        }
      );

      setConversations(sortedConversations);
      setAllMessages(response.data.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải tin nhắn. Vui lòng thử lại sau.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  // Initialize user and socket connection
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedUser = jwtDecode(token);
      setCurrentUser({
        id: decodedUser.id,
        name: decodedUser.name,
      });

      socket.auth = { token };
      socket.connect();

      fetchAllMessages();
    }

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [fetchAllMessages]);

  // Socket event listeners
  useEffect(() => {
    if (!currentUser) return;

    socket.on("message_sent", (response) => {
      if (response.success) {
        const message = response.data;

        setConversations((prev) => {
          const newConversations = [...prev];
          const existingConvIndex = newConversations.findIndex(
            (conv) => conv.sender._id === message.recipientId
          );

          if (existingConvIndex !== -1) {
            newConversations[existingConvIndex].messages.push(message);
            newConversations[existingConvIndex].lastMessage = message;
          } else {
            newConversations.unshift({
              sender: message.recipient || {
                _id: message.recipientId,
                name: "Unknown User", // Fallback name
              },
              messages: [message],
              lastMessage: message,
              unreadCount: 0,
            });
          }

          return newConversations.sort((a, b) => {
            if (a.unreadCount !== b.unreadCount) {
              return b.unreadCount - a.unreadCount;
            }
            return (
              new Date(b.lastMessage.timestamp) -
              new Date(a.lastMessage.timestamp)
            );
          });
        });
      }
    });

    socket.on("receive_message", (message) => {
      console.log("New message received:", message);

      setConversations((prev) => {
        const newConversations = [...prev];
        const existingConvIndex = newConversations.findIndex(
          (conv) => conv.sender._id === message.senderId._id
        );

        if (existingConvIndex !== -1) {
          newConversations[existingConvIndex].messages.push(message);
          newConversations[existingConvIndex].lastMessage = message;
          newConversations[existingConvIndex].unreadCount++;
        } else {
          newConversations.unshift({
            sender: message.senderId,
            messages: [message],
            lastMessage: message,
            unreadCount: 1,
          });
        }

        return newConversations.sort((a, b) => {
          if (a.unreadCount !== b.unreadCount) {
            return b.unreadCount - a.unreadCount;
          }
          return (
            new Date(b.lastMessage.timestamp) -
            new Date(a.lastMessage.timestamp)
          );
        });
      });

      // Show notification
      if (document.hidden && Notification.permission === "granted") {
        new Notification("Tin nhắn mới", {
          body: `${message.senderId.name}: ${message.content}`,
        });
      }
    });

    socket.on("messages_marked_read", ({ senderId }) => {
      setConversations((prev) => {
        const newConversations = [...prev];
        const convIndex = newConversations.findIndex(
          (conv) => conv.sender._id === senderId
        );

        if (convIndex !== -1) {
          newConversations[convIndex].unreadCount = 0;
          newConversations[convIndex].messages.forEach(
            (msg) => (msg.read = true)
          );
        }

        return newConversations.sort((a, b) => {
          if (a.unreadCount !== b.unreadCount) {
            return b.unreadCount - a.unreadCount;
          }
          return (
            new Date(b.lastMessage.timestamp) -
            new Date(a.lastMessage.timestamp)
          );
        });
      });
    });

    // Thêm listener cho event xóa conversation
    socket.on("conversation_deleted", ({ recipientId }) => {
      setConversations((prev) => {
        const newConversations = prev.filter(
          (conv) => conv.sender._id !== recipientId
        );
        return newConversations;
      });

      // Reset selected tenant và đóng chat nếu đang chat với người bị xóa
      if (selectedTenant?.id === recipientId) {
        setSelectedTenant(null);
        setShowChat(false);
      }
    });

    return () => {
      socket.off("message_sent");
      socket.off("receive_message");
      socket.off("messages_marked_read");
      socket.off("conversation_deleted");
    };
  }, [currentUser, selectedTenant]);

  const handleSelectTenant = (tenant) => {
    if (!currentUser) {
      toast({
        title: "Lỗi",
        description: "Vui lòng đăng nhập lại",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Nếu đang chat với người này rồi thì ẩn/hiện chat
    if (selectedTenant?.id === tenant.id) {
      setShowChat(!showChat);
    } else {
      // Nếu chọn người khác thì hiện chat và cập nhật selectedTenant
      setSelectedTenant(tenant);
      setShowChat(true);
    }
  };

  return (
    <Flex h="100vh" p={4}>
      <Box w="300px" borderRight="1px" borderColor="gray.200" pr={4}>
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Tin nhắn
        </Text>
        <VStack spacing={3} align="stretch">
          {conversations.map((conversation) => (
            <Box
              key={conversation.sender._id}
              p={3}
              bg={
                selectedTenant?.id === conversation.sender._id
                  ? "blue.50"
                  : conversation.unreadCount > 0
                  ? "gray.100"
                  : "white"
              }
              borderRadius="md"
              cursor="pointer"
              _hover={{ bg: "gray.100" }}
              onClick={() =>
                handleSelectTenant({
                  id: conversation.sender._id,
                  name: conversation.sender.name,
                })
              }
            >
              <HStack spacing={3}>
                <Avatar size="sm" name={conversation.sender.name} />
                <Box flex={1}>
                  <HStack justify="space-between">
                    <Text fontWeight="bold">{conversation.sender.name}</Text>
                    {conversation.unreadCount > 0 && (
                      <Badge colorScheme="red" borderRadius="full">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </HStack>
                  <Text noOfLines={1} fontSize="sm">
                    {conversation.lastMessage.content}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {new Date(
                      conversation.lastMessage.timestamp
                    ).toLocaleString()}
                  </Text>
                </Box>
              </HStack>
            </Box>
          ))}
        </VStack>
      </Box>

      {/* Chat Area */}
      <Box flex={1} pl={4}>
        {showChat && currentUser && selectedTenant && (
          <Chat
            currentUserId={currentUser.id}
            recipientId={selectedTenant.id}
            recipientName={selectedTenant.name}
            onClose={() => setShowChat(false)}
          />
        )}
      </Box>
    </Flex>
  );
};

export default MessageManagement;
