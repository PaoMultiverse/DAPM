import React, { useState, useEffect } from "react";
import {
  Box,
  Avatar,
  Text,
  VStack,
  Divider,
  HStack,
  Button,
  Input,
  useToast,
  IconButton,
  Stack,
  Flex,
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useLoaderData, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
function ProfilePage() {
  const toast = useToast();
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newAvatar, setNewAvatar] = useState(null);

  // Sample user data
  const [originalUser, setOriginalUser] = useState({
    name: "Pukachu",
    email: "pukachu@example.com",
    numPhone: "0123456789",
    dob: "2000-01-01",
    password: "******",
    avatar: "https://bit.ly/broken-link",
  });
  // useEffect để lấy token từ localStorage và giải mã nó
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      try {
        const decodedUser = jwtDecode(storedToken);
        setUserData(decodedUser);
      } catch (error) {
        console.error("Lỗi giải mã token:", error);
      }
    }
  }, []); // Chạy một lần khi thành phần được gắn vào

  // useEffect để gọi API và lấy thông tin người dùng
  useEffect(() => {
    const fetchUser = async () => {
      if (token && userData.id) {
        // Chỉ gọi API khi token và userData.id đã sẵn sàng
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API}/user/${userData.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setUser(response.data.data);
        } catch (error) {
          console.error("Lỗi khi lấy thông tin người dùng:", error);
        }
      }
    };

    fetchUser();
  }, [token, userData.id]); // Chạy khi token hoặc userData.id thay đổi

  const toggleEdit = () => {
    if (isEditing) {
      // If canceling, revert to original user data
      setUser(originalUser);
    } else {
      // Store the original user data when editing starts
      setOriginalUser(user);
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "dob") {
      const formattedDate = new Date(value).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      setUser((prevUser) => ({ ...prevUser, [name]: formattedDate }));
    } else {
      setUser((prevUser) => ({ ...prevUser, [name]: value }));
    }
  };

  // Update avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAvatar(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    if (newAvatar) {
      setUser((prev) => ({ ...prev, avatar: newAvatar }));
    }
    setNewAvatar(null);
    setIsEditing(false);
    toast({
      title: "Thông tin đã được cập nhật!",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Stack>
      <Box maxW="md" mx="auto" p={4} textAlign="center">
        <Box position="relative" display="inline-block">
          <Avatar
            name={user?.name || `Đang tải...`}
            size="2xl"
            src={newAvatar}
            mb={4}
          />
          {isEditing && (
            <IconButton
              icon={<EditIcon />}
              position="absolute"
              bottom={3}
              left={20}
              onClick={() => document.getElementById("avatar-input").click()}
              aria-label="Chỉnh sửa avatar"
              size="sm"
              bg="rgba(0, 0, 0, 0.5)"
              color="white"
              borderRadius="50%"
              _hover={{ bg: "rgba(0, 0, 0, 0.7)" }}
              _focus={{ outline: "none" }}
            />
          )}
          <input
            id="avatar-input"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: "none" }}
          />
        </Box>

        {isEditing ? (
          <Input
            width="70%"
            name="name"
            value={user?.name || `Đang tải...`}
            onChange={handleChange}
            fontSize="2xl"
            fontWeight="bold"
            mb={2}
            textAlign="center"
            placeholder="Tên của bạn"
          />
        ) : (
          <Text fontSize="2xl" fontWeight="bold">
            {user?.name || `Đang tải...`}
          </Text>
        )}

        <Divider my={4} />
        <VStack spacing={4}>
          <HStack justify="space-between" width="100%">
            <Text fontWeight="medium">Email:</Text>
            {isEditing ? (
              <Input
                width="70%"
                name="email"
                value={user?.email || "Đang tải ..."}
                onChange={handleChange}
                size="sm"
              />
            ) : (
              <Text>{user?.email || "Đang tải..."}</Text>
            )}
          </HStack>
          <HStack justify="space-between" width="100%">
            <Text fontWeight="medium">Số điện thoại:</Text>
            {isEditing ? (
              <Input
                width="70%"
                name="numPhone"
                value={user.numPhone}
                onChange={handleChange}
                size="sm"
              />
            ) : (
              <Text>{user?.numPhone || "Đang tải..."}</Text>
            )}
          </HStack>
          <HStack justify="space-between" width="100%">
            <Text fontWeight="medium">Ngày sinh:</Text>
            {isEditing ? (
              <Input
                width="70%"
                name="dob"
                type="date"
                value={user.dob}
                onChange={handleChange}
                size="sm"
              />
            ) : (
              <Text>{user?.dob || "Đang tải..."}</Text>
            )}
          </HStack>
        </VStack>
        <Divider my={4} />
        <Button
          colorScheme="blue"
          mt={4}
          onClick={isEditing ? handleSave : toggleEdit}
        >
          {isEditing ? "Lưu thay đổi" : "Chỉnh sửa thông tin"}
        </Button>
        {isEditing && (
          <Button colorScheme="gray" mt={4} ml={2} onClick={toggleEdit}>
            Hủy
          </Button>
        )}
      </Box>
    </Stack>
  );
}

export default ProfilePage;
