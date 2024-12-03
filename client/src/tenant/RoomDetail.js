import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Container,
  Image,
  Text,
  VStack,
  Heading,
  Grid,
  GridItem,
  Tag,
  List,
  ListItem,
  ListIcon,
  Button,
  useToast,
  Flex,
  Center,
  Sp,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  ModalFooter,
} from "@chakra-ui/react";
import { MdCheckCircle } from "react-icons/md";
import Chat from "../components/Chat";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

import { FaArrowLeft } from "react-icons/fa";

const RoomDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const [room, setRoom] = useState(location.state?.roomData || null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [landlordInfo, setLandlordInfo] = useState(null);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [isOpenBooking, setIsOpenBooking] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser(decoded);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (!room) {
      const fetchRoomDetail = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API}/user/room-detail/${id}`
          );
          if (response.data.success) {
            setRoom(response.data.data);
          }
        } catch (error) {
          console.error("Error fetching room detail:", error);
          toast({
            title: "Lỗi",
            description: "Không thể tải thông tin phòng",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      };

      fetchRoomDetail();
    }
  }, [id, room, toast]);
  const BookingModal = ({ isOpen, onClose, room, currentUser }) => {
    const [bookingData, setBookingData] = useState({
      proposedDate: "",
      alternativeDate: "",
      message: "",
    });
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
      try {
        setIsSubmitting(true);
        if (!bookingData.proposedDate) {
          toast({
            title: "Lỗi",
            description: "Vui lòng chọn ngày xem phòng",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        console.log("Sending booking data:", {
          roomId: room.id,
          landlordId: room.landlordId,
          ...bookingData,
        });

        const response = await axios.post(
          `${process.env.REACT_APP_API}/booking/create`,
          {
            roomId: room.id,
            landlordId: room.landlordId,
            proposedDate: bookingData.proposedDate,
            alternativeDate: bookingData.alternativeDate || null,
            message: bookingData.message || "",
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          toast({
            title: "Thành công",
            description: (
              <Box>
                <Text>Đã gửi yêu cầu xem phòng</Text>
                <Button
                  onClick={() => navigate("/tenant/bookings")}
                  size="sm"
                  mt={2}
                  colorScheme="blue"
                >
                  Xem lịch sử đặt phòng
                </Button>
              </Box>
            ),
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          onClose();
        }
      } catch (error) {
        console.error("Booking error:", error.response?.data || error);
        toast({
          title: "Lỗi",
          description:
            error.response?.data?.message || "Không thể gửi yêu cầu xem phòng",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Đặt lịch xem phòng</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box mb={4} p={4} borderWidth={1} borderRadius="md">
              <Heading size="sm" mb={2}>
                Thông tin phòng:
              </Heading>
              <Text>
                <strong>Tên phòng:</strong> {room.roomName}
              </Text>
              <Text>
                <strong>Giá thuê:</strong>{" "}
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(room.price)}
              </Text>
              <Text>
                <strong>Diện tích:</strong> {room.area}m²
              </Text>
            </Box>

            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Ngày xem phòng</FormLabel>
                <Input
                  type="datetime-local"
                  value={bookingData.proposedDate}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      proposedDate: e.target.value,
                    })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>Ngày xem thay thế (không bắt buộc)</FormLabel>
                <Input
                  type="datetime-local"
                  value={bookingData.alternativeDate}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      alternativeDate: e.target.value,
                    })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>Lời nhắn</FormLabel>
                <Textarea
                  value={bookingData.message}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      message: e.target.value,
                    })
                  }
                  placeholder="Nhập lời nhắn cho chủ trọ..."
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Đang gửi..."
            >
              Gửi yêu cầu
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Hủy
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };
  const onOpenBooking = () => setIsOpenBooking(true);
  const fetchLandlordInfo = async (landlordId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API}/user/${landlordId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        setLandlordInfo(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching landlord info:", error);
    }
  };

  if (!room) {
    return (
      <Center>
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      {/* Nút Quay lại */}
      <Button
        onClick={() => navigate(-1)} // Quay lại trang trước
        colorScheme="teal"
        leftIcon={<FaArrowLeft />}
        mb={4}
      >
        Quay lại
      </Button>
      <Box bg="white" borderRadius="lg" overflow="hidden" boxShadow="lg">
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
          <GridItem>
            <Image
              src={room.image}
              alt={room.roomName}
              w="100%"
              h="500px"
              objectFit="cover"
            />
          </GridItem>

          <GridItem p={6}>
            <VStack align="stretch" spacing={6}>
              <Heading size="lg">{room.roomTitle}</Heading>

              <Box>
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(room.price)}
                </Text>
                <Tag
                  size="lg"
                  colorScheme={room.status === "Còn trống" ? "green" : "red"}
                  mt={2}
                >
                  {room.status}
                </Tag>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={2}>
                  Địa chỉ:
                </Text>
                <Text>{room.address}</Text>
              </Box>

              <Grid templateColumns="1fr 1fr" gap={4}>
                <Box>
                  <Text fontWeight="bold">Diện tích</Text>
                  <Text>{room.area} m²</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Tiền cọc</Text>
                  <Text>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(room.deposit)}
                  </Text>
                </Box>
              </Grid>

              <Box>
                <Text fontWeight="bold" mb={2}>
                  Tiện ích:
                </Text>
                <List spacing={2}>
                  {room.amenities.map((amenity, index) => (
                    <ListItem key={index}>
                      <ListIcon as={MdCheckCircle} color="green.500" />
                      {amenity}
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Flex gap={4}>
                <Button
                  colorScheme="teal"
                  size="lg"
                  onClick={async () => {
                    if (currentUser) {
                      await fetchLandlordInfo(room.landlordId);
                      setShowChat(true);
                    } else {
                      toast({
                        title: "Vui lòng đăng nhập",
                        description: "Bạn cần đăng nhập để chat với chủ trọ",
                        status: "warning",
                        duration: 3000,
                        isClosable: true,
                      });
                    }
                  }}
                >
                  Liên hệ chủ trọ
                </Button>
                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={() => {
                    if (currentUser) {
                      setIsOpenDetail(false);
                      onOpenBooking();
                    } else {
                      toast({
                        title: "Vui lòng đăng nhập",
                        description: "Bạn cần đăng nhập để đặt lịch xem phòng",
                        status: "warning",
                        duration: 3000,
                        isClosable: true,
                      });
                    }
                  }}
                >
                  Đặt lịch xem phòng
                </Button>
              </Flex>
            </VStack>
          </GridItem>
        </Grid>
      </Box>

      {showChat &&
        currentUser &&
        room.landlordId &&
        currentUser.id !== room.landlordId &&
        landlordInfo && (
          <Chat
            currentUserId={currentUser.id}
            recipientId={room.landlordId.toString()}
            recipientName={landlordInfo.name}
            onClose={() => setShowChat(false)}
          />
        )}
    </Container>
  );
};

export default RoomDetail;
