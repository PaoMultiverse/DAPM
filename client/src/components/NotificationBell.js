import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  PopoverTrigger,
  PopoverContent,
  VStack,
  Text,
  Box,
  useToast
} from '@chakra-ui/react';
import { BiBell } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API}/notifications`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setNotifications(response.data.data);
      setUnreadCount(response.data.data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (notification.type === 'BILL') {
      navigate(`/tenant/bills/${notification.billId}`);
      
      try {
        await axios.patch(
          `${process.env.REACT_APP_API}/notifications/${notification._id}/read`,
          {},
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
        fetchNotifications();
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Box position="relative">
          <IconButton
            icon={<BiBell size={24} />}
            variant="ghost"
            aria-label="Notifications"
          />
          {unreadCount > 0 && (
            <Badge
              position="absolute"
              top="-1"
              right="-1"
              colorScheme="red"
              borderRadius="full"
            >
              {unreadCount}
            </Badge>
          )}
        </Box>
      </PopoverTrigger>
      <PopoverContent>
        <VStack align="stretch" p={2} maxH="400px" overflowY="auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Box
                key={notification._id}
                p={2}
                bg={notification.isRead ? 'gray.50' : 'blue.50'}
                borderRadius="md"
                cursor="pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <Text fontWeight="bold">{notification.title}</Text>
                <Text fontSize="sm">{notification.message}</Text>
                <Text fontSize="xs" color="gray.500">
                  {new Date(notification.createdAt).toLocaleString()}
                </Text>
              </Box>
            ))
          ) : (
            <Text p={2}>Không có thông báo</Text>
          )}
        </VStack>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell; 