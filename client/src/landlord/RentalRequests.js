import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Flex,
  Stack,
  Avatar,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  HStack,
  VStack,
  Image,
  Heading,
  Spinner,
  useToast,
  FormControl,
  FormLabel,
  Input,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tag,
  Link,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  ButtonGroup,
  Td,
} from "@chakra-ui/react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const RentalRequest = () => {
  const toast = useToast();
  const [rentalRequests, setRentalRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpenInfoRoom, setIsOpenInfoRoom] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isOpenContract, setIsOpenContract] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isOpenUpdate, setIsOpenUpdate] = useState(false); // State quản lý modal cập nhật số điện nước

  // Hàm đóng/mở modal cập nhật số điện nước
  const openUpdateModal = () => setIsOpenUpdate(true);
  const closeUpdateModal = () => setIsOpenUpdate(false);
  const [contractDetails, setContractDetails] = useState({
    startDate: "",
    endDate: "",
    depositFee: "",
    rentFee: "",
    electricityFee: "",
    waterFee: "",
  });

  //State quản lý tab active
  const [activeTab, setActiveTab] = useState("pending");

  // Thêm state để quản lý loading khi lấy thông tin phòng
  const [isLoadingRoom, setIsLoadingRoom] = useState(false);

  // Thêm state cho bookings
  const [bookings, setBookings] = useState([]);

  // Thêm state để quản lý tab index
  const [tabIndex, setTabIndex] = useState(0);
  const location = useLocation();

  // Đọc query parameter khi component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) {
      setTabIndex(parseInt(tab));
    }
  }, [location.search]);

  // Wrap fetchRentalRequests trong useCallback
  const fetchRentalRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API}/rental-request/landlord`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        // Thêm log để kiểm tra cấu trúc dữ liệu
        console.log("Full rental requests data:", response.data.data);

        const pending = response.data.data.filter(
          (req) => req.status === "pending"
        );
        const accepted = response.data.data.filter(
          (req) => req.status === "accepted"
        );

        // Log chi tiết về cấu trúc địa chỉ
        console.log("Sample room data:", pending[0]?.roomId);
        console.log("Sample hostel data:", pending[0]?.roomId?.hostelId);

        setRentalRequests(pending);
        setAcceptedRequests(accepted);
      }
    } catch (error) {
      console.error("Error fetching rental requests:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách yêu cầu thuê",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  // Thêm fetchRentalRequests vào dependency array của useEffect

  // Thêm fetchBookings function
  const fetchBookings = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API}/booking/landlord`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        // Thêm log để kiểm tra cấu trúc dữ liệu booking
        console.log("Bookings data:", response.data.data);
        console.log("Sample booking room data:", response.data.data[0]?.roomId);
        console.log(
          "Sample booking hostel data:",
          response.data.data[0]?.roomId?.hostelId
        );

        setBookings(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách đặt lịch xem phòng",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  // Cập nhật useEffect để fetch cả bookings
  useEffect(() => {
    fetchRentalRequests();
    fetchBookings();
  }, [fetchRentalRequests, fetchBookings]);

  const openRoomInfoModal = async (request) => {
    try {
      setIsLoadingRoom(true);
      console.log("Request:", request); // Debug log

      const roomId = request.roomId._id;
      console.log("Room ID:", roomId); // Debug log

      const response = await axios.get(
        `${process.env.REACT_APP_API}/landlord/hostel/${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("API Response:", response.data); // Debug log

      if (response.data.success) {
        setSelectedRoom(response.data.data);
        setIsOpenInfoRoom(true);
      }
    } catch (error) {
      console.error("Error fetching room details:", error);
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể tải thông tin phòng",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingRoom(false);
    }
  };

  const closeRoomInfoModal = () => {
    setIsOpenInfoRoom(false);
    setSelectedRoom(null);
  };

  const handleAccept = async (request) => {
    try {
      openContractModal(request);
    } catch (error) {
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể chấp nhận yêu cầu",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleReject = async (request) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API}/rental-request/${request._id}/status`,
        {
          status: "rejected",
          rejectReason: "Không đáp ứng yêu cầu", // Có thể thêm modal để nhập lý do
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        toast({
          title: "Thành công",
          description: "Đã từ chối yêu cầu thuê phòng",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        // Refresh danh sách
        fetchRentalRequests();
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể từ chối yêu cầu",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openContractModal = (request) => {
    console.log("Request in openContractModal:", request);
    if (!request.landlordId) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy thông tin chủ trọ",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setSelectedRequest(request);
    setIsOpenContract(true);
  };

  const closeContractModal = () => {
    setIsOpenContract(false);
    setSelectedRequest(null);
    setContractDetails({
      startDate: "",
      endDate: "",
      depositFee: "",
      rentFee: "",
      electricityFee: "",
      waterFee: "",
    });
  };

  const handleContractDetailsChange = (e) => {
    const { name, value } = e.target;
    setContractDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateContract = async () => {
    try {
      // Kiểm tra các trường bắt buộc
      if (
        !contractDetails.startDate ||
        !contractDetails.endDate ||
        !contractDetails.depositFee ||
        !contractDetails.rentFee ||
        !contractDetails.electricityFee ||
        !contractDetails.waterFee
      ) {
        toast({
          title: "Lỗi",
          description: "Vui lòng điền đầy đủ thông tin hợp đồng",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Log để kiểm tra selectedRequest
      console.log("Selected Request:", selectedRequest);

      // Kiểm tra landlordId
      if (!selectedRequest.landlordId) {
        toast({
          title: "Lỗi",
          description: "Không tìm thấy thông tin chủ trọ",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Tạo hợp đồng
      const contractResponse = await axios.post(
        `${process.env.REACT_APP_API}/landlord/contract/create`,
        {
          roomId: selectedRequest.roomId._id,
          tenantId: selectedRequest.tenantId._id,
          landlordId: selectedRequest.landlordId,
          startDate: new Date(contractDetails.startDate),
          endDate: new Date(contractDetails.endDate),
          depositFee: Number(contractDetails.depositFee),
          rentFee: Number(contractDetails.rentFee),
          electricityFee: Number(contractDetails.electricityFee),
          waterFee: Number(contractDetails.waterFee),

          utilities: {
            electricity: {
              unitPrice: Number(contractDetails.electricityFee),
              initialReading: 0,
              currentReading: 0,
              lastUpdated: new Date(),
            },
            water: {
              unitPrice: Number(contractDetails.waterFee),
              initialReading: 0,
              currentReading: 0,
              lastUpdated: new Date(),
            },
          },
          monthlyFees: [],
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (contractResponse.data.success) {
        // Log để kiểm tra response
        console.log("Contract creation response:", contractResponse.data);

        // Refresh danh sách để lấy dữ liệu mới
        await fetchRentalRequests();

        toast({
          title: "Thành công",
          description: "Đã tạo hợp đồng thành công",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        closeContractModal();
        openUpdateModal();
      }
    } catch (error) {
      console.error("Contract creation error:", error);
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể tạo hợp đồng",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Thêm hàm xử lý booking
  const handleBookingAction = async (bookingId, status) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API}/booking/${bookingId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        toast({
          title: "Thành công",
          description: `Đã ${
            status === "accepted" ? "chấp nhận" : "từ chối"
          } lịch xem phòng`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchBookings();
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể cập nhật trạng thái",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box>
      <Heading
        textColor={"brand.700"}
        as="h3"
        size="lg"
        mb={{ base: 4, md: 12 }}
      >
        Quản Lý Đặt Lịch & Yêu Cầu Thuê Phòng
      </Heading>

      <Tabs
        isFitted
        variant="enclosed"
        size={{ base: "sm", md: "md" }}
        index={tabIndex}
        onChange={(index) => {
          setTabIndex(index);
          const newUrl = `${window.location.pathname}?tab=${index}`;
          window.history.pushState({}, "", newUrl);
        }}
      >
        <TabList mb="1em">
          <Tab>Lịch xem phòng</Tab>
          <Tab>Yêu cầu chờ duyệt</Tab>
          <Tab>Yêu cầu đã chấp nhận</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Người đặt lịch</Th>
                    <Th>Thông tin phòng</Th>
                    <Th>Ngày xem</Th>
                    <Th>Ngày dự phòng</Th>
                    <Th>Trạng thái</Th>
                    <Th>Thao tác</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {bookings.map((booking) => (
                    <Tr key={booking._id}>
                      <Td>
                        <VStack align="start">
                          <Text fontWeight="bold">
                            {booking.tenantId?.name}
                          </Text>
                          <Text fontSize="sm">
                            {booking.tenantId?.numPhone}
                          </Text>
                          <Text fontSize="sm">{booking.tenantId?.email}</Text>
                        </VStack>
                      </Td>
                      <Td>
                        <VStack align="start">
                          <Button
                            variant="link"
                            onClick={() => openRoomInfoModal(booking)}
                          >
                            {booking.roomId?.roomName || "N/A"}
                          </Button>
                          <Text fontSize="sm" color="gray.600">
                            Cơ sở:{" "}
                            {booking.roomId?.hostelId?.name ||
                              "Chưa có thông tin"}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            Địa chỉ:{" "}
                            {`${booking.roomId?.hostelId?.address || ""}`}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        {new Date(booking.proposedDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </Td>
                      <Td>
                        {booking.alternativeDate
                          ? new Date(
                              booking.alternativeDate
                            ).toLocaleDateString("vi-VN")
                          : "Không có"}
                      </Td>
                      <Td>
                        <Tag
                          colorScheme={
                            booking.status === "pending"
                              ? "yellow"
                              : booking.status === "accepted"
                              ? "green"
                              : "red"
                          }
                        >
                          {booking.status === "pending"
                            ? "Chờ duyệt"
                            : booking.status === "accepted"
                            ? "Đã chấp nhận"
                            : "Đã từ chối"}
                        </Tag>
                      </Td>
                      <Td>
                        {booking.status === "pending" && (
                          <ButtonGroup>
                            <Button
                              colorScheme="green"
                              size="sm"
                              onClick={() =>
                                handleBookingAction(booking._id, "accepted")
                              }
                            >
                              Chấp nhận
                            </Button>
                            <Button
                              colorScheme="red"
                              size="sm"
                              onClick={() =>
                                handleBookingAction(booking._id, "rejected")
                              }
                            >
                              Từ chối
                            </Button>
                          </ButtonGroup>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>

          <TabPanel>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Người thuê</Th>
                  <Th>Thông tin phòng</Th>
                  <Th>Ngày yêu cầu</Th>
                  <Th>Thao tác</Th>
                </Tr>
              </Thead>
              <Tbody>
                {rentalRequests.map((request) => (
                  <Tr key={request._id}>
                    <Td>
                      <VStack align="start">
                        <Text fontWeight="bold">{request.tenantId.name}</Text>
                        <Text fontSize="sm">{request.tenantId.numPhone}</Text>
                        <Text fontSize="sm">{request.tenantId.email}</Text>
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start">
                        <Button
                          variant="link"
                          onClick={() => openRoomInfoModal(request)}
                        >
                          {request?.roomId?.roomName}
                        </Button>
                        <Text fontSize="sm" color="gray.600">
                          Cơ sở:{" "}
                          {request?.roomId?.hostelId?.name ||
                            "Chưa có thông tin"}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Địa chỉ:{" "}
                          {request?.roomId?.hostelId?.address ||
                            "Chưa có thông tin"}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      {new Date(request?.createdAt).toLocaleDateString("vi-VN")}
                    </Td>
                    <Td>
                      <ButtonGroup>
                        <Button
                          colorScheme="green"
                          onClick={() => handleAccept(request)}
                        >
                          Chấp nhận
                        </Button>
                        <Button
                          colorScheme="red"
                          onClick={() => handleReject(request)}
                        >
                          Từ chối
                        </Button>
                      </ButtonGroup>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TabPanel>

          <TabPanel>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Người thuê</Th>
                  <Th>Thông tin phòng</Th>
                  <Th>Ngày chấp nhận</Th>
                  <Th>Mã hợp đồng</Th>
                  <Th>Trạng thái</Th>
                </Tr>
              </Thead>
              <Tbody>
                {acceptedRequests.map((request) => (
                  <Tr key={request._id}>
                    <Td>
                      <VStack align="start">
                        <Text fontWeight="bold">{request.tenantId.name}</Text>
                        <Text fontSize="sm">{request.tenantId.phone}</Text>
                        <Text fontSize="sm">{request.tenantId.email}</Text>
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start">
                        <Text fontWeight="bold">{request.roomId.roomName}</Text>
                        <Text fontSize="sm" color="gray.600">
                          Cơ sở:{" "}
                          {request.roomId.hostelId?.name || "Chưa có thông tin"}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Địa chỉ:{" "}
                          {request.roomId.hostelId?.address ||
                            "Chưa có thông tin"}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      {new Date(request.updatedAt).toLocaleDateString("vi-VN")}
                    </Td>
                    <Td>
                      {request._id ? (
                        <Link
                          color="blue.500"
                          href={`/contracts/${request._id}`}
                        >
                          {request._id.substring(0, 8)}...
                        </Link>
                      ) : (
                        <Text color="gray.500">Chưa có mã hợp đồng</Text>
                      )}
                    </Td>
                    <Td>
                      <Tag
                        colorScheme={
                          request.status === "accepted" ? "green" : "gray"
                        }
                      >
                        {request.status === "accepted"
                          ? "Đã chấp nhận"
                          : "Chưa xác định"}
                      </Tag>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Modal hiển thị thông tin phòng */}
      <Modal
        isCentered
        isOpen={isOpenInfoRoom}
        onClose={closeRoomInfoModal}
        size="2xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text fontSize="2xl" fontWeight="bold" align="center">
              {selectedRoom?.roomName || "Đang tải..."}
            </Text>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            {isLoadingRoom ? (
              <Box textAlign="center" py={10}>
                <Spinner size="xl" />
              </Box>
            ) : (
              <HStack align="start" spacing={4}>
                <Image
                  src={selectedRoom?.images?.[0] || "/default-room.jpg"}
                  alt={selectedRoom?.roomName || "Phòng trọ"}
                  fallbackSrc="/default-room.jpg"
                  borderRadius="md"
                  boxSize="250px"
                  objectFit="cover"
                />

                <VStack align="start" spacing={2} flex="1">
                  <Text fontWeight="bold">Cơ sở:</Text>
                  <Text>
                    {selectedRoom?.hostelId?.name || "Chưa có thông tin"}
                  </Text>
                  <Text fontWeight="bold">Địa chỉ:</Text>
                  <Text>
                    {selectedRoom?.hostelId?.address || "Chưa có thông tin"}
                  </Text>
                  <Text fontWeight="bold">Giá điện:</Text>
                  <Text>
                    {selectedRoom?.electricityUnitPrice?.toLocaleString(
                      "vi-VN"
                    )}
                    VND/số
                  </Text>
                  <Text fontWeight="bold">Giá nước:</Text>
                  <Text>
                    {selectedRoom?.waterUnitPrice?.toLocaleString("vi-VN")}
                    VND/khối
                  </Text>
                  <Text fontWeight="bold">Giá phòng:</Text>
                  <Text>
                    {selectedRoom?.price?.toLocaleString("vi-VN")} VND
                  </Text>
                  <Text fontWeight="bold">Tiền cọc:</Text>
                  <Text>
                    {selectedRoom?.deposit?.toLocaleString("vi-VN")} VND
                  </Text>
                  <Text fontWeight="bold">Diện tích:</Text>
                  <Text>{selectedRoom?.area || "Chưa có thông tin"} m²</Text>
                  <Text fontWeight="bold">Mô tả:</Text>
                  <Text>{selectedRoom?.description || "Chưa có mô tả"}</Text>
                </VStack>
              </HStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="gray" onClick={closeRoomInfoModal}>
              Đóng
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal tạo hợp đồng */}
      <Modal
        isOpen={isOpenContract}
        onClose={closeContractModal}
        size={{ base: "full", md: "xl" }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            textTransform={"capitalize"}
            fontSize={"2xl"}
            fontWeight={"bold"}
            textColor={"brand.700"}
            textAlign={"center"}
          >
            Tạo Hợp Đồng Thuê Phòng
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Ngày bắt đầu</FormLabel>
                <Input
                  type="date"
                  name="startDate"
                  value={contractDetails.startDate}
                  onChange={handleContractDetailsChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Ngày kết thúc</FormLabel>
                <Input
                  type="date"
                  name="endDate"
                  value={contractDetails.endDate}
                  onChange={handleContractDetailsChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Tiền đặt cọc (VNĐ)</FormLabel>
                <Input
                  type="number"
                  name="depositFee"
                  value={contractDetails.depositFee}
                  onChange={handleContractDetailsChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Tiền thuê hàng tháng (VNĐ)</FormLabel>
                <Input
                  type="number"
                  name="rentFee"
                  value={contractDetails.rentFee}
                  onChange={handleContractDetailsChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Giá điện (VNĐ/số)</FormLabel>
                <Input
                  type="number"
                  name="electricityFee"
                  value={contractDetails.electricityFee}
                  onChange={handleContractDetailsChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Giá nước (VNĐ/khối)</FormLabel>
                <Input
                  type="number"
                  name="waterFee"
                  value={contractDetails.waterFee}
                  onChange={handleContractDetailsChange}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={handleCreateContract}>
              Tạo hợp đồng
            </Button>
            <Button onClick={closeContractModal}>Hủy</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* modal cập nhật số điện nước */}
      <Modal
        isCentered
        isOpen={isOpenUpdate}
        onClose={closeUpdateModal}
        size="md"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cập Nhật Số Điện Nước</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Chỉ số điện</FormLabel>
                <Input placeholder="Nhập chỉ số điện" type="number" />
              </FormControl>
              <FormControl>
                <FormLabel>Chỉ số nước</FormLabel>
                <Input placeholder="Nhập chỉ số nước" type="number" />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={closeUpdateModal}>
              Lưu
            </Button>
            <Button onClick={closeUpdateModal}>Hủy</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default RentalRequest;
