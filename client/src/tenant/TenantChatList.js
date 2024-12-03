import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Text,
  VStack,
  HStack,
  Avatar,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Divider,
  Badge,
  Flex,
  useToast,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Chat from '../components/Chat';
import { jwtDecode } from "jwt-decode";
import socket from '../services/socket';

const TenantChatList = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedLandlord, setSelectedLandlord] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser(decoded);
      } catch (error) {
        console.error('Token decode error:', error);
        toast({
          title: "Lỗi",
          description: "Vui lòng đăng nhập lại",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  }, [toast]);

  const fetchConversations = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      console.log('Fetching conversations with token:', token);
      const response = await axios.get(
        `${process.env.REACT_APP_API}/messages/tenant/conversations`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('API Response:', response.data);

      if (response.data.success) {
        setConversations(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      toast({
        title: "Lỗi",
        description: "Không thể tải tin nhắn. Vui lòng thử lại sau.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!socket.connected || !currentUser) return;

    socket.on('receive_message', (message) => {
      console.log('New message received:', message);
      
      setConversations(prev => {
        const newConversations = [...prev];
        const existingConvIndex = newConversations.findIndex(
          conv => conv.landlord._id === message.senderId._id
        );

        if (existingConvIndex !== -1) {
          newConversations[existingConvIndex].messages.push(message);
          newConversations[existingConvIndex].lastMessage = message;
          newConversations[existingConvIndex].unreadCount++;
        } else {
          newConversations.unshift({
            landlord: message.senderId,
            messages: [message],
            lastMessage: message,
            unreadCount: 1
          });
        }

        return newConversations.sort((a, b) => {
          if (a.unreadCount !== b.unreadCount) {
            return b.unreadCount - a.unreadCount;
          }
          return new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp);
        });
      });

      // Show notification
      if (document.hidden && Notification.permission === "granted") {
        new Notification('Tin nhắn mới', {
          body: `${message.senderId.name}: ${message.content}`
        });
      }
    });

    socket.on('messages_marked_read', ({ senderId }) => {
      setConversations(prev => {
        const newConversations = [...prev];
        const convIndex = newConversations.findIndex(
          conv => conv.landlord._id === senderId
        );

        if (convIndex !== -1) {
          newConversations[convIndex].unreadCount = 0;
          newConversations[convIndex].messages.forEach(msg => msg.read = true);
        }

        return newConversations.sort((a, b) => {
          if (a.unreadCount !== b.unreadCount) {
            return b.unreadCount - a.unreadCount;
          }
          return new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp);
        });
      });
    });

    return () => {
      socket.off('receive_message');
      socket.off('messages_marked_read');
    };
  }, [currentUser]);

  const handleSelectLandlord = (landlord) => {
    if (selectedLandlord?.id === landlord.id) {
      setShowChat(!showChat);
    } else {
      setSelectedLandlord(landlord);
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
              key={conversation.landlord._id}
              p={3}
              bg={selectedLandlord?.id === conversation.landlord._id ? "blue.50" : 
                  conversation.unreadCount > 0 ? "gray.100" : "white"}
              borderRadius="md"
              cursor="pointer"
              _hover={{ bg: "gray.100" }}
              onClick={() =>
                handleSelectLandlord({
                  id: conversation.landlord._id,
                  name: conversation.landlord.name,
                })
              }
            >
              <HStack spacing={3}>
                <Avatar size="sm" name={conversation.landlord.name} />
                <Box flex={1}>
                  <HStack justify="space-between">
                    <Text fontWeight="bold">{conversation.landlord.name}</Text>
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
                    {new Date(conversation.lastMessage.timestamp).toLocaleString()}
                  </Text>
                </Box>
              </HStack>
            </Box>
          ))}
        </VStack>
      </Box>

      {showChat && selectedLandlord && currentUser && (
        <Chat
          currentUserId={currentUser.id}
          recipientId={selectedLandlord.id}
          recipientName={selectedLandlord.name}
          onClose={() => setShowChat(false)}
        />
      )}
    </Flex>
  );
};

export default TenantChatList; 