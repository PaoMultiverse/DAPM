import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  IconButton,
  VStack,
  Flex,
  SimpleGrid,
  Button,
  useBreakpointValue,
} from "@chakra-ui/react";
import { CalendarIcon, CheckCircleIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function HomeDashboard() {
  const [userData, setUserData] = useState({});
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
    const user = jwtDecode(token);
    setUserData({ name: user.name });
  }, []);

  const navigateToRentalRequests = (tabIndex) => {
    navigate(`/landlord/rental-request?tab=${tabIndex}`);
  };

  const hostel = [
    "Facility 1 - Address",
    "Facility 2 - Address",
    "Facility 3 - Address",
  ];

  const bookingRequests = [
    "John Doe requested - Room 101",
    "Jane Smith requested - Room 202",
    "Alice Johnson requested - Room 303",
  ];

  return (
    <Box p={{ base: 4, md: 5 }} w="100%">
      <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" mb={4}>
        Chào mừng trở lại, {userData.name}!
      </Text>
      {/* Tác vụ nhanh */}
      <Box mb={5}>
        <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" mb={3}>
          Tác vụ nhanh
        </Text>
        <VStack align="start" spacing={4}>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} w="100%">
            <Button
              leftIcon={<CalendarIcon />}
              colorScheme="green"
              variant="outline"
              onClick={() => navigate("/landlord/hostel-management")}
              fontSize={{ base: "sm", md: "md" }}
            >
              Quản lý cơ sở
            </Button>
            <Button
              leftIcon={<CalendarIcon />}
              colorScheme="purple"
              variant="outline"
              onClick={() => navigateToRentalRequests(0)}
              fontSize={{ base: "sm", md: "md" }}
            >
              Quản lý đặt lịch
            </Button>
            <Button
              leftIcon={<CheckCircleIcon />}
              colorScheme="teal"
              variant="outline"
              onClick={() => navigateToRentalRequests(1)}
              fontSize={{ base: "sm", md: "md" }}
            >
              Danh sách yêu cầu
            </Button>
          </SimpleGrid>
        </VStack>
      </Box>

      {/* Danh sách cơ sở */}
      <Box mb={5}>
        <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" mb={3}>
          Danh sách các cơ sở
        </Text>
        <VStack align="start" spacing={2} w="100%">
          {hostel.map((hostel, index) => (
            <Flex key={index} align="center" gap={2}>
              <CalendarIcon color="blue.500" />
              <Text fontSize={{ base: "sm", md: "md" }}>{hostel}</Text>
            </Flex>
          ))}
        </VStack>
      </Box>

      {/* Danh sách yêu cầu thuê phòng */}
      <Box mb={5}>
        <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" mb={3}>
          Danh sách các yêu cầu thuê phòng
        </Text>
        <VStack
          align="start"
          spacing={2}
          onClick={() => navigateToRentalRequests(1)}
          cursor="pointer"
          _hover={{ bg: "gray.50" }}
          w="100%"
        >
          {bookingRequests.map((request, index) => (
            <Flex key={index} align="center" gap={2}>
              <CheckCircleIcon color="green.500" />
              <Text fontSize={{ base: "sm", md: "md" }}>{request}</Text>
            </Flex>
          ))}
        </VStack>
      </Box>
    </Box>
  );
}

export default HomeDashboard;
