import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  SimpleGrid,
  Image,
  Text,
  Tag,
  VStack,
  Heading,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  List,
  ListItem,
  ListIcon,
  Center,
  Spinner,
  useToast,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Grid,
  GridItem,
  Select,
  Container,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  TagCloseButton,
  HStack,
} from "@chakra-ui/react";
import { FiFilter } from "react-icons/fi";
import { FaArrowLeft } from "react-icons/fa";
import { MdCheckCircle } from "react-icons/md";
import Chat from "../components/Chat";
import { jwtDecode } from "jwt-decode";
import { Link as RouterLink, useNavigate } from "react-router-dom";

const TenantRoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const toast = useToast();
  const [isOpenBooking, setIsOpenBooking] = useState(false);
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterAddress, setFilterAddress] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [landlordInfo, setLandlordInfo] = useState(null);

  const FilterForm = () => (
    <VStack
      spacing={2}
      align="center"
      bg="white"
      p={6}
      borderRadius="xl"
      boxShadow="md"
      border="2px solid"
      borderColor="gray.200"
      top="30%"
      zIndex="8"
    >
      <Text fontSize="xl" fontWeight="bold" mb={2}>
        Lọc để tìm kiếm
      </Text>

      <HStack width="100%">
        <Input
          placeholder="Tìm kiếm chi tiết..."
          value={searchTerm}
          onChange={handleSearchChange}
          bg="white"
          _hover={{ borderColor: "blue.500" }}
          autoFocus
        />
      </HStack>
      <Select
        value={filterCity} // Hiển thị giá trị đã chọn
        onChange={handleCityChange}
        bg="white"
        _hover={{ borderColor: "blue.500" }}
      >
        {!filterCity && <option value="">Chọn thành phố</option>}{" "}
        {/* Hiển thị option "Chọn thành phố" nếu chưa chọn */}
        {Array.from(new Set(rooms.map((room) => room.address.split(", ")[3])))
          .filter((city) => city) // Lọc bỏ giá trị null/undefined
          .sort() // Sắp xếp theo alphabet
          .map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
      </Select>

      <Select
        value={filterDistrict} // Hiển thị giá trị đã chọn
        onChange={handleDistrictChange}
        bg="white"
        _hover={{ borderColor: "blue.500" }}
        isDisabled={!filterCity} // Disable nếu chưa chọn thành phố
      >
        {!filterDistrict && <option value="">Chọn quận</option>}{" "}
        {/* Hiển thị option "Chọn quận" nếu chưa chọn */}
        {Array.from(
          new Set(
            rooms
              .filter(
                (room) => !filterCity || room.address.includes(filterCity)
              ) // Lọc theo thành phố đã chọn
              .map((room) => room.address.split(", ")[2])
          )
        )
          .filter((district) => district) // Lọc bỏ giá trị null/undefined
          .sort() // Sắp xếp theo alphabet
          .map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
      </Select>

      <Select
        value={priceRange} // Hiển thị giá trị đã chọn
        onChange={handlePriceRangeChange}
        bg="white"
        _hover={{ borderColor: "blue.500" }}
      >
        {!priceRange && <option value="">Chọn khoảng giá</option>}{" "}
        {/* Hiển thị option "Chọn khoảng giá" nếu chưa chọn */}
        <option value="500000-1000000">500.000đ - 1.000.000đ</option>
        <option value="1000000-3000000">1.000.000đ - 3.000.000đ</option>
        <option value="3000000-6000000">3.000.000đ - 6.000.000đ</option>
        <option value="6000000-9000000">6.000.000đ - 9.000.000đ</option>
        <option value="9000000-12000000">9.000.000đ - 12.000.000đ</option>
        <option value="12000000-20000000">12.000.000đ - 20.000.000đ</option>
      </Select>

      {/* Nút reset filter */}
      {(searchTerm || filterCity || filterDistrict || priceRange) && (
        <Button
          colorScheme="red"
          variant="outline"
          size="sm"
          onClick={() => {
            setSearchTerm("");
            setFilterCity("");
            setFilterDistrict("");
            setPriceRange("");
          }}
        >
          Xóa bộ lọc
        </Button>
      )}
    </VStack>
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCityChange = (e) => {
    const newCity = e.target.value;
    setFilterCity(newCity);

    // Reset quận và khoảng giá khi đổi thành phố
    setFilterDistrict("");
    setPriceRange("");
  };

  const handleDistrictChange = (e) => {
    const newDistrict = e.target.value;
    setFilterDistrict(newDistrict);

    // Reset khoảng giá khi đổi quận
    setPriceRange("");
  };

  const handlePriceRangeChange = (e) => {
    const newPriceRange = e.target.value;
    setPriceRange(newPriceRange);
  };

  const handleAddressChange = (e) => {
    setFilterAddress(e.target.value);
  };

  const handleMinPriceChange = (e) => {
    setMinPrice(e.target.value);
  };

  const handleMaxPriceChange = (e) => {
    setMaxPrice(e.target.value);
  };

  const filteredRooms = rooms.filter((room) => {
    const price = room.price || 0;
    let minPrice = 0;
    let maxPrice = Infinity;

    switch (priceRange) {
      case "500000-1000000":
        minPrice = 500000;
        maxPrice = 1000000;
        break;
      case "1000000-3000000":
        minPrice = 1000000;
        maxPrice = 3000000;
        break;
      case "3000000-6000000":
        minPrice = 3000000;
        maxPrice = 6000000;
        break;
      case "6000000-9000000":
        minPrice = 6000000;
        maxPrice = 9000000;
        break;
      case "9000000-10000000":
        minPrice = 9000000;
        maxPrice = 10000000;
        break;
      case "10000000-20000000":
        minPrice = 10000000;
        maxPrice = 20000000;
        break;
      default:
        break;
    }

    return (
      room.roomTitle.toLowerCase().includes(searchTerm.toLowerCase()) &&
      room.address.includes(filterCity) &&
      room.address.includes(filterDistrict) &&
      room.address.includes(filterAddress) &&
      price >= minPrice &&
      price <= maxPrice
    );
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        console.log(localStorage.getItem("token"));
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }

        console.log("Fetching rooms with token:", token);
        console.log("API URL:", `${process.env.REACT_APP_API}/user/rooms`);

        const response = await axios.get(
          `${process.env.REACT_APP_API}/user/rooms`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("API Response:", response.data);

        if (response.data.success && Array.isArray(response.data.data)) {
          const formattedRooms = response.data.data.map((room) => ({
            id: room._id,
            roomTitle: room.roomTitle || "Không có tiêu đề",
            roomName: room.roomName || "Không có tên",
            landlordId:
              room.hostelId?.landlordId?._id || room.hostelId?.landlordId,
            image:
              room.images && room.images.length > 0
                ? room.images[0]
                : "https://via.placeholder.com/200",
            address: room.hostelId
              ? `${room.hostelId.address || ""}, ${room.hostelId.ward || ""}, ${
                  room.hostelId.district || ""
                }, ${room.hostelId.city || ""}`
              : "Địa chỉ không có sẵn",
            status: room.status === "available" ? "Còn trống" : "Đã thuê",
            price: room.price || 0,
            area: room.area || 0,
            description: room.description || "Không có mô tả",
            deposit: room.deposit || 0,
            amenities: [
              "Wifi miễn phí",
              "Bảo vệ 24/7",
              "Chỗ để xe",
              "Tự do giờ giấc",
            ],
          }));
          console.log("Formatted Rooms:", formattedRooms);
          setRooms(formattedRooms);
        } else {
          console.log("No rooms data or invalid format");
          setRooms([]);
        }
      } catch (error) {
        console.error("Error fetching rooms:", error.response || error);
        setRooms([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

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

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setIsOpenDetail(true);
  };

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
  const onCloseBooking = () => setIsOpenBooking(false);

  const handleCloseChat = () => {
    setShowChat(false);
  };
  const handleGoBack = () => {
    navigate(-1);
  };

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

  return (
    <Flex
      direction="column" // Thay đổi hướng thành cột để chứa nút và container
      alignItems="stretch"
    >
      <Flex
        alignItems="center"
        justifyContent="space-between"
        mb={4}
        flexWrap="wrap" // Cho phép các phần tử xếp chồng lên nhau khi cần
      >
        <Button
          onClick={handleGoBack}
          colorScheme="teal"
          leftIcon={<FaArrowLeft />}
          mb={{ base: 2, md: 0 }} // Thêm khoảng cách dưới nút ở chế độ mobile
        >
          Quay lại
        </Button>

        <IconButton
          icon={<FiFilter />}
          onClick={onOpen}
          colorScheme="blue"
          aria-label="Open filters"
          display={{ base: "flex", md: "none" }}
        />
      </Flex>
      <Container maxW="container.xl" py={4}>
        {/* Tiêu đề danh sách phòng */}
        <Flex
          alignItems="center"
          justifyContent="center"
          mb={4}
          flexWrap="wrap" // Cho phép xếp chồng khi cần
        >
          <Text fontSize="3xl" fontWeight="bold" textAlign="center" mx={4}>
            Danh sách phòng
          </Text>
        </Flex>

        {/* Hiển thị các filter đã chọn */}
        <Flex
          mb={4}
          gap={2}
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap" // Cho phép các phần tử xếp chồng lên nhau khi cần
        >
          {(searchTerm || filterCity || filterDistrict || priceRange) && (
            <>
              {searchTerm && (
                <Tag colorScheme="blue" size="md">
                  Địa chỉ chi tiết: {searchTerm}
                  <TagCloseButton onClick={() => setSearchTerm("")} />
                </Tag>
              )}
              {filterCity && (
                <Tag colorScheme="green" size="md">
                  {filterCity}
                  <TagCloseButton onClick={() => setFilterCity("")} />
                </Tag>
              )}
              {filterDistrict && (
                <Tag colorScheme="purple" size="md">
                  {filterDistrict}
                  <TagCloseButton onClick={() => setFilterDistrict("")} />
                </Tag>
              )}
              {priceRange && (
                <Tag colorScheme="orange" size="md">
                  {priceRange
                    .split("-")
                    .map((price) => Number(price).toLocaleString("vi-VN"))
                    .join(" - ")}{" "}
                  đ
                  <TagCloseButton onClick={() => setPriceRange("")} />
                </Tag>
              )}
            </>
          )}
        </Flex>
        {/* Filter Drawer cho mobile */}
        <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">Bộ lọc tìm kiếm</DrawerHeader>
            <DrawerBody>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onClose();
                }}
              >
                <FilterForm />
                <Button mt={4} colorScheme="blue" w="100%" onClick={onClose}>
                  Áp dụng
                </Button>
              </form>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
        <Grid templateColumns={{ base: "1fr", md: "1fr 3fr" }} gap={6}>
          {/* Form filter cho desktop */}
          <Box display={{ base: "none", md: "block" }}>
            <form>
              <FilterForm />
            </form>
          </Box>

          {isLoading ? (
            <Center>
              <Spinner size="xl" />
            </Center>
          ) : filteredRooms.length === 0 ? (
            <Flex
              alignItems="center"
              justifyContent="center"
              mb={4}
              flexWrap="wrap" // Cho phép xếp chồng khi cần
            >
              <Text textAlign="center" w="100%">
                Không có phòng nào
              </Text>
            </Flex>
          ) : (
            <Box className="mb-20">
              <Box className="container mx-auto">
                <SimpleGrid
                  columns={{ base: 1, md: 2, lg: 3 }}
                  spacing={{ base: 4, lg: 4 }}
                >
                  {filteredRooms.map((room) => (
                    <Box
                      key={room.id}
                      borderWidth="1px"
                      borderRadius="lg"
                      overflow="hidden"
                      boxShadow="md"
                      bg="white"
                      height="100%"
                      display="flex"
                      flexDirection="column"
                      onClick={() => handleRoomClick(room)}
                      cursor="pointer"
                      _hover={{
                        transform: "scale(1.02)",
                        transition: "all 0.2s",
                      }}
                      p={2}
                    >
                      <Image
                        src={room.image}
                        alt={room.roomName}
                        w="100%"
                        h="200px"
                        objectFit="cover"
                        fallbackSrc="https://via.placeholder.com/200"
                        borderRadius={{ base: "8px", lg: "8px" }}
                      />
                      <VStack p={4} align="stretch" spacing={2} flex="1">
                        <Text
                          fontWeight="bold"
                          fontSize="lg"
                          noOfLines={1} // Giới hạn tiêu đề 1 dòng
                        >
                          {room.roomTitle}
                        </Text>
                        {/* <Flex alignItems="flex-start">
                       <Text fontWeight="bold" width="70px" flexShrink={0}>
                        Địa chỉ:
                      </Text>
                      <Text 
                        color="gray.600" 
                        fontSize="sm"  
                        noOfLines={2}  // Giới hạn địa chỉ 2 dòng
                      >
                        {room.address}
                      </Text> 
                    </Flex> */}
                        <Flex
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Text fontWeight="bold">Tình trạng:</Text>
                          <Tag
                            colorScheme={
                              room.status === "Còn trống" ? "green" : "red"
                            }
                          >
                            {room.status}
                          </Tag>
                        </Flex>
                        {/* <Flex justifyContent="space-between">
                      <Text fontWeight="bold">Giá:</Text>
                      <Text>
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(room.price)}
                      </Text>
                    </Flex> */}
                      </VStack>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>
            </Box>
          )}
        </Grid>

        <Modal
          isOpen={isOpenDetail}
          onClose={() => setIsOpenDetail(false)}
          size={{ base: "full", md: "xl" }} // Responsive size
          isCentered // Căn giữa modal
        >
          <ModalOverlay />
          <ModalContent
            mx={{ base: "4", md: "auto" }}
            my={{ base: "4", md: "auto" }}
            maxH={{ base: "100vh", md: "90vh" }}
            overflow="auto" // Cho phép scroll nếu nội dung dài
          >
            <ModalHeader>Chi tiết phòng</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedRoom && (
                <VStack spacing={4}>
                  <Image
                    src={selectedRoom.image}
                    alt={selectedRoom.roomName}
                    w="100%"
                    h="300px"
                    objectFit="cover"
                    borderRadius={{ base: "20px", lg: "20px" }}
                  />
                  <Button
                    colorScheme="yellow"
                    width="100%"
                    onClick={() => {
                      navigate(`/tenant/room-detail/${selectedRoom.id}`, {
                        // Sử dụng đường dẫn mới
                        state: { roomData: selectedRoom },
                      });
                    }}
                  >
                    Xem chi tiết
                  </Button>
                  <Flex
                    direction={{ base: "column", md: "row" }}
                    gap={6}
                    width="100%"
                  >
                    <VStack
                      align="stretch"
                      spacing={4}
                      w={{ base: "100%", md: "100%" }}
                    >
                      {/* <Box>
                      <Text fontWeight="bold">Địa chỉ:</Text>
                      <Text color="gray.600">{selectedRoom.address}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">Diện tích:</Text>
                      <Text color="gray.600">{selectedRoom.area} m²</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">Giá thuê:</Text>
                      <Text color="gray.600">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(selectedRoom.price)}
                      </Text>
                    </Box> */}

                      <Box>
                        <Text fontWeight="bold">Đặt cọc:</Text>
                        <Text color="gray.600">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(selectedRoom.deposit)}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold">Tiện ích:</Text>
                        <List spacing={2}>
                          {selectedRoom.amenities.map((amenity, index) => (
                            <ListItem key={index} color="gray.600">
                              <ListIcon as={MdCheckCircle} color="green.500" />
                              {amenity}
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </VStack>
                  </Flex>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Grid templateColumns="repeat(3, 1fr)" gap={3} width="100%">
                <Button
                  colorScheme="red"
                  onClick={() => setIsOpenDetail(false)}
                >
                  Đóng
                </Button>
                <Button
                  colorScheme="teal"
                  onClick={async () => {
                    if (currentUser) {
                      await fetchLandlordInfo(selectedRoom.landlordId);
                      setShowChat(true);
                      setIsOpenDetail(false);
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
              </Grid>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {showChat &&
          currentUser &&
          selectedRoom &&
          selectedRoom.landlordId &&
          currentUser.id !== selectedRoom.landlordId &&
          landlordInfo && (
            <Chat
              currentUserId={currentUser.id}
              recipientId={selectedRoom.landlordId.toString()}
              recipientName={landlordInfo.name}
              onClose={handleCloseChat}
            />
          )}

        {isOpenBooking && selectedRoom && (
          <BookingModal
            isOpen={isOpenBooking}
            onClose={onCloseBooking}
            room={selectedRoom}
            currentUser={currentUser}
          />
        )}
      </Container>
    </Flex>
  );
};

export default TenantRoomList;
