import { useState, useEffect } from "react";
import React from "react";
import {
  VStack,
  Box,
  Image,
  Heading,
  Text,
  Button,
  Grid,
  Stack,
  Link,
  Icon,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  IconButton,
  Container,
  Flex,
  useToast,
  Tag,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import {
  FaFacebook,
  FaYoutube,
  FaInstagram,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Banner from "./Banner";
import { useLocation } from "react-router-dom";
import axios from "axios"; // Import axios để gọi API
import { MdCheckCircle } from "react-icons/md";

const categories = [
  { name: "Quận 1", image: "./houses/house1.png" },
  { name: "Quận 2", image: "./houses/house2.png" },
  { name: "Quận 3", image: "./houses/house3.png" },
  { name: "Quận 4", image: "./houses/house4.png" }, // Thêm danh mục mới
  { name: "Quận 5", image: "./houses/house5.png" }, // Thêm danh mục mới
  { name: "Quận 6", image: "./houses/house6.png" }, // Thêm danh mục mới

  // Thêm các quận khác
];

const heroImages = ["./house1.png", "./house2.png", "./house3.png"];
const images = [
  "./house1.png",
  "./house2.png",
  "./house3.png",
  // Add more image URLs as needed
];

const testimonials = [
  {
    quote:
      "Sống ở đây quả là một trải nghiệm tuyệt vời. Các phòng đều rộng rãi và được bảo trì tốt.",
    author: "Minh",
    avatar: "https://via.placeholder.com/50",
  },
  {
    quote:
      "Đội ngũ quản lý luôn tích cực và đáp ứng mọi nhu cầu. Tôi cảm thấy an toàn như ở nhà.",
    author: "Lan",
    avatar: "https://via.placeholder.com/50",
  },
  {
    quote:
      "Một địa điểm tuyệt vời! Gần phương tiện giao thông công cộng và tiện ích địa phương. Rất khuyến khích!",
    author: "Hùng",
    avatar: "https://via.placeholder.com/50",
  },
  {
    quote:
      "Tôi yêu không khí cộng đồng ở đây.Một nơi tuyệt vời để gặp gỡ những người bạn mới.",
    author: "An",
    avatar: "https://via.placeholder.com/50",
  },
];

// Profile
const curriculumPathways = [
  {
    name: "Bảo",
    avatar: "./profile1.png",
    role: "BE",
    description:
      "Bảo is responsible for overseeing the project and ensuring everything runs smoothly.",
  },
  {
    name: "Uyên",
    avatar: "./profile2.png",
    role: "FE",
    description:
      "Uyên leads the development team and is passionate about creating user-friendly applications.",
  },
  {
    name: "Hưng",
    avatar: "./profile1.png",
    role: "FE",
    description:
      "Hưng focuses on designing intuitive interfaces and enhancing user experience.",
  },
  {
    name: "Hào",
    avatar: "./profile1.png",
    role: "BE",
    description:
      "Hào is in charge of marketing strategies and community engagement.",
  },
];

// About & Values Section
const contentData = [
  {
    image: "./house1.png",
    title: "Sứ Mệnh và Giá Trị Của Chúng Tôi",
    description: (
      <>
        Tại{" "}
        <Link color="blue.500" fontWeight="bold" href="/hostel-community">
          Hostel Community
        </Link>
        , chúng tôi cam kết tạo ra một môi trường sống an toàn và thoải mái cho
        tất cả cư dân. Sứ mệnh của chúng tôi là cung cấp không gian sống lý
        tưởng, nơi mọi người có thể phát triển và kết nối. Chúng tôi tin tưởng
        vào:
      </>
    ),
    values: [
      {
        title: "1. Sự An Toàn:",
        description:
          "Chúng tôi đảm bảo rằng mọi cư dân đều cảm thấy an toàn và được bảo vệ trong không gian sống của mình.",
      },
      {
        title: "2. Cộng Đồng Gắn Kết:",
        description:
          "Chúng tôi khuyến khích sự giao lưu và hỗ trợ lẫn nhau giữa các cư dân, tạo nên một cộng đồng vững mạnh.",
      },
      {
        title: "3. Phát Triển Bền Vững:",
        description:
          "Chúng tôi cam kết cung cấp các dịch vụ và tiện ích bền vững, góp phần vào sự phát triển của cộng đồng.",
      },
    ],
  },

  {
    image: "./house2.png",
    title: "Giá Trị Cốt Lõi",
    description: (
      <>
        Chúng tôi tin rằng mỗi cư dân đều có giá trị và xứng đáng được tôn
        trọng. Chúng tôi tạo ra một không gian nơi mọi người có thể tự do thể
        hiện bản thân và phát triển.
      </>
    ),
    values: [
      {
        title: "4. Tôn Trọng Đa Dạng:",
        description:
          "Chúng tôi chào đón mọi nền văn hóa và phong cách sống khác nhau.",
      },
      {
        title: "5. Hỗ Trợ Lẫn Nhau:",
        description:
          "Chúng tôi khuyến khích sự hỗ trợ và giúp đỡ lẫn nhau giữa các cư dân.",
      },
    ],
  },

  {
    image: "house3.png",
    title: "Cộng Đồng Đoàn Kết",
    description: (
      <>
        Chúng tôi xây dựng một cộng đồng nơi mọi người có thể kết nối và hỗ trợ
        lẫn nhau, tạo ra một môi trường sống tích cực và thân thiện.
      </>
    ),
    values: [
      {
        title: "6. Giao Lưu Văn Hóa:",
        description:
          "Chúng tôi tổ chức các sự kiện để cư dân có thể giao lưu và học hỏi từ nhau.",
      },
      {
        title: "7. Hoạt Động Cộng Đồng:",
        description:
          "Chúng tôi khuyến khích cư dân tham gia vào các hoạt động cộng đồng để xây dựng mối quan hệ.",
      },
    ],
  },
];

function TenantDashboard() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const toast = useToast();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [rooms, setRooms] = useState([]); // Danh sách phòng
  const [currentSlide, setCurrentSlide] = useState(0); // Slide hiện tại
  const [selectedRoom, setSelectedRoom] = useState(null); // Phòng được chọn
  const [isOpenDetail, setIsOpenDetail] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [landlordInfo, setLandlordInfo] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [isOpenBooking, setIsOpenBooking] = useState(false);

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
      }
    };

    fetchRooms();
  }, []);

  // Điều hướng carousel
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(rooms.length / 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? Math.ceil(rooms.length / 3) - 1 : prev - 1
    );
  };

  // Xử lý khi chọn phòng
  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setIsOpenDetail(true);
  };

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  const filteredRooms = rooms.filter(
    (room) => room.category === selectedCategory
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  // Hàm mở modal
  const handleOpenDetails = (name) => {
    const member = curriculumPathways.find((member) => member.name === name);
    setSelectedMember(member);
    setIsOpen(true);
  };

  // Hàm đóng modal
  const handleClose = () => {
    setIsOpen(false);
  };

  // Phần slide đầu

  // Hàm chuyển đổi hình ảnh
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
  };

  // Tự động chuyển đổi hình ảnh sau mỗi 5 giây
  useEffect(() => {
    const interval = setInterval(nextImage, 4000);
    return () => clearInterval(interval); // Dọn dẹp interval khi component unmount
  }, []);

  // About & Values Section

  // Hàm chuyển đổi nội dung
  const nextContent = () => {
    setCurrentContentIndex((prevIndex) => (prevIndex + 1) % contentData.length);
  };

  // Tự động chuyển đổi nội dung sau mỗi 5 giây
  useEffect(() => {
    const interval = setInterval(nextContent, 6000);
    return () => clearInterval(interval); // Dọn dẹp interval khi component unmount
  }, []);
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
  const onOpenBooking = () => setIsOpenBooking(true);
  const handleCloseChat = () => {
    setShowChat(false);
  };
  return (
    <VStack spacing={10} align="center" p={4} w="100%">
      {/* Banner Section */}
      <Box mb={20}>
        <Banner />
      </Box>

      <Heading size="lg">Danh sách phòng</Heading>

      {/* Carousel */}
      <Flex
        position="relative"
        w="100%"
        maxW="1200px"
        overflow="hidden"
        alignItems="center"
      >
        <IconButton
          icon={<FaChevronLeft />}
          position="absolute"
          left="0"
          zIndex="10"
          bg="gray.700"
          color="white"
          borderRadius="full"
          _hover={{ bg: "gray.500" }}
          onClick={prevSlide}
          aria-label="Previous slide"
        />
        <IconButton
          icon={<FaChevronRight />}
          position="absolute"
          right="0"
          zIndex="10"
          bg="gray.700"
          color="white"
          borderRadius="full"
          _hover={{ bg: "gray.500" }}
          onClick={nextSlide}
          aria-label="Next slide"
        />

        {/*  hiển thị Phòng*/}
        <Flex
          as={motion.div}
          w="100%"
          display="flex"
          gap={4}
          transform={`translateX(-${currentSlide * 100}%)`}
          transition="transform 0.5s ease-in-out"
        >
          {rooms.map((room, index) => (
            <Box
              key={index}
              flex="0 0 33.333%"
              maxW="33.333%"
              p={4}
              bg="white"
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              boxShadow="md"
              onClick={() => handleRoomClick(room)}
              cursor="pointer"
              _hover={{ transform: "scale(1.02)", transition: "all 0.2s" }}
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
                <Flex justifyContent="space-between" alignItems="center">
                  <Text fontWeight="bold">Tình trạng:</Text>
                  <Tag
                    colorScheme={room.status === "Còn trống" ? "green" : "red"}
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
        </Flex>
      </Flex>

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
              <Button colorScheme="red" onClick={() => setIsOpenDetail(false)}>
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
      {/* Modal */}

      {/* <VStack spacing={10} align="center" p={4} w="100%">
     
      <Flex overflow="hidden" mb={10} w="100%" justifyContent="center" >
        <Flex as={motion.div} whileTap={{ cursor: "grabbing" }} w="100%" overflowX="auto">
          {categories.map((category, index) => (
            <Box key={index} p={4} minW="200px" textAlign="center" onClick={() => handleCategoryClick(category.name)}>
              <Image src={category.image} alt={category.name} boxSize="150px" objectFit="cover" />
              <Text mt={2} fontWeight="bold">{category.name}</Text>
            </Box>
          ))}
        </Flex>
      </Flex>

     
      {selectedCategory && (
        <Box w="100%">
          <Heading size="md" mb={4}>Phòng tại {selectedCategory}</Heading>
          {filteredRooms.map((room, index) => (
            <Box key={index} p={4} mb={4} bg="white" borderRadius="lg" boxShadow="lg">
              <Image src={room.image} alt="Room" w="100%" h="200px" objectFit="cover" borderRadius="md" />
              <Text fontWeight="bold" mt={4}>Địa chỉ:</Text>
              <Text>{room.address}</Text>
              <Text fontWeight="bold" mt={2}>Diện tích:</Text>
              <Text>{room.area}</Text>
              <Text fontWeight="bold" mt={2}>Giá thuê:</Text>
              <Text>{room.price}</Text>
              <Text fontWeight="bold" mt={2}>Đặt cọc:</Text>
              <Text>{room.deposit}</Text>
              <Text fontWeight="bold" mt={2}>Tiện ích:</Text>
              <VStack align="start" spacing={1}>
                {room.amenities.map((amenity, idx) => (
                  <Text key={idx}>- {amenity}</Text>
                ))}
              </VStack>
            </Box>
          ))}
        </Box>
      )}
    </VStack> */}

      {/* Danh mục */}
      {/* <Flex overflow="hidden" mb={10} w="100%" justifyContent="center">
          <Flex as={motion.div} whileTap={{ cursor: "grabbing" }} w="100%" overflowX="auto" justifyContent="center">
            {categories.map((category, index) => (
              <Box 
                key={index} 
                p={4} 
                minW="200px" 
                textAlign="center" 
                onClick={() => handleCategoryClick(category.name)}
                borderRadius="md" 
                boxShadow="md" 
                transition="transform 0.2s" 
                _hover={{ transform: "scale(1.05)", boxShadow: "lg" }} // Hiệu ứng hover
              >
                <Image src={category.image} alt={category.name} boxSize="150px" objectFit="cover" borderRadius="md" />
                <Text mt={2} fontWeight="bold">{category.name}</Text>
              </Box>
            ))}
          </Flex>
        </Flex> */}

      {/* RoomList button */}
      <Box display="flex" justifyContent="center" mb={20}>
        <Button
          size="lg"
          height="60px"
          width={{ base: "90%", md: "300px" }}
          bg="orange.400"
          onClick={() => navigate("room-list")}
          fontSize="xl"
          _hover={{
            transform: "translateY(-2px)",
            boxShadow: "xl",
          }}
          transition="all 0.2s"
        >
          Tìm Phòng Ngay!
        </Button>
      </Box>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={handleClose} size="md">
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px)" />
        <ModalContent>
          <ModalHeader borderBottomWidth="1px" py={4}>
            <HStack spacing={4} align="center">
              <Image
                src={selectedMember?.avatar}
                alt={selectedMember?.name}
                borderRadius="full"
                boxSize="60px"
                objectFit="cover"
                border="3px solid"
                borderColor="blue.500"
              />
              <VStack align="start" spacing={1}>
                <Heading size="md">{selectedMember?.name}</Heading>
                <Text color="blue.500" fontWeight="medium" fontSize="sm">
                  {selectedMember?.role}
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <Text lineHeight="tall">{selectedMember?.description}</Text>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" py={4}>
            <Button colorScheme="blue" onClick={handleClose} size="lg" w="full">
              Đóng
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
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
              <Button colorScheme="red" onClick={() => setIsOpenDetail(false)}>
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
      {/* News & Updates */}
      {/* <Heading fontSize="2xl" textAlign="center">Tin tức & Thành tựu</Heading>
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} w="100%">
        {images.map((img, idx) => (
          <Box key={idx} w="100%" h="250px" bgImage={`url(${img})`} bgSize="cover" borderRadius="lg" 
          _hover={{ transform: "scale(1.05)" }}
              transition="transform 0.2s" />
        ))}
      </Grid> */}
    </VStack>
  );
}

export default TenantDashboard;
