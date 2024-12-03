import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Divider,
  Select,
  Container,
  Input,
  useToast,
  Spinner,
  Badge,
  Stack,
  InputGroup,
  InputLeftElement
} from "@chakra-ui/react";
import { FaArrowLeft, FaSearch, FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function TenantPayments() {
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("all");
  const [customDate, setCustomDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API}/bills/history`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setPayments(response.data.data);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải lịch sử thanh toán",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatInputDate = (input) => {
    const numbers = input.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  };

  const handleDateChange = (e) => {
    const formattedDate = formatInputDate(e.target.value);
    setCustomDate(formattedDate);
    setSelectedTimeFrame("custom");
  };

  const isValidDate = (dateString) => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(dateString)) return false;
    const [, day, month, year] = dateString.match(regex);
    const date = new Date(year, month - 1, day);
    return date && date.getMonth() === month - 1 && date.getDate() == day;
  };

  const filterPayments = () => {
    let filtered = [...payments];
    const currentDate = new Date();

    // Lọc theo thời gian
    if (customDate && isValidDate(customDate)) {
      const [day, month, year] = customDate.split("/");
      const searchDate = new Date(year, month - 1, day);
      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate.toDateString() === searchDate.toDateString();
      });
    } else {
      switch (selectedTimeFrame) {
        case "month":
          filtered = filtered.filter(payment => {
            const paymentDate = new Date(payment.paymentDate);
            return paymentDate.getMonth() === currentDate.getMonth() &&
                   paymentDate.getFullYear() === currentDate.getFullYear();
          });
          break;
        case "year":
          filtered = filtered.filter(payment => {
            const paymentDate = new Date(payment.paymentDate);
            return paymentDate.getFullYear() === currentDate.getFullYear();
          });
          break;
      }
    }

    // Lọc theo search term
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.roomId.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.totalAmount.toString().includes(searchTerm)
      );
    }

    return filtered;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PAID: { color: "green", text: "Đã thanh toán" },
      PENDING: { color: "yellow", text: "Chờ thanh toán" },
      OVERDUE: { color: "red", text: "Quá hạn" }
    };
    const config = statusConfig[status] || { color: "gray", text: status };
    return <Badge colorScheme={config.color}>{config.text}</Badge>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <Container maxW="container.xl" py={4}>
      <Stack spacing={6}>
        <Flex alignItems="center" justifyContent="space-between">
          <Button
            onClick={() => navigate(-1)}
            colorScheme="teal"
            leftIcon={<FaArrowLeft />}
          >
            Quay lại
          </Button>
          <Text fontSize="2xl" fontWeight="bold">
            Lịch sử thanh toán
          </Text>
          <Box w="40px" /> {/* Để cân bằng layout */}
        </Flex>

        <Stack direction={["column", "row"]} spacing={4}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <FaSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Tìm kiếm theo phòng hoặc số tiền..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          <Select
            value={selectedTimeFrame}
            onChange={(e) => setSelectedTimeFrame(e.target.value)}
            maxW="200px"
          >
            <option value="all">Tất cả thời gian</option>
            <option value="month">Tháng này</option>
            <option value="year">Năm này</option>
            <option value="custom">Tùy chọn</option>
          </Select>

          {selectedTimeFrame === "custom" && (
            <InputGroup maxW="200px">
              <InputLeftElement pointerEvents="none">
                <FaCalendarAlt color="gray.300" />
              </InputLeftElement>
              <Input
                value={customDate}
                onChange={handleDateChange}
                placeholder="DD/MM/YYYY"
                maxLength={10}
              />
            </InputGroup>
          )}
        </Stack>

        {isLoading ? (
          <Flex justify="center" align="center" h="200px">
            <Spinner size="xl" color="teal.500" />
          </Flex>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple" borderWidth={1} borderRadius="lg">
              <Thead bg="teal.50">
                <Tr>
                  <Th>Phòng</Th>
                  <Th>Ngày thanh toán</Th>
                  <Th>Phương thức</Th>
                  <Th isNumeric>Số tiền</Th>
                  <Th>Trạng thái</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filterPayments().map((payment, index) => (
                  <Tr
                    key={payment._id}
                    cursor="pointer"
                    _hover={{ bg: "gray.50" }}
                    onClick={() => {
                      setSelectedPayment(payment);
                      setIsOpenDetail(true);
                    }}
                  >
                    <Td>{payment.roomId.roomName}</Td>
                    <Td>{formatDate(payment.paymentDate)}</Td>
                    <Td>{payment.paymentMethod}</Td>
                    <Td isNumeric>{formatCurrency(payment.totalAmount)}</Td>
                    <Td>{getStatusBadge(payment.status)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}

        <Modal isOpen={isOpenDetail} onClose={() => setIsOpenDetail(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Chi tiết thanh toán</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedPayment && (
                <VStack align="stretch" spacing={3}>
                  <Box p={4} borderWidth={1} borderRadius="md" bg="gray.50">
                    <Text fontWeight="bold" mb={2}>Thông tin phòng</Text>
                    <Text>Phòng: {selectedPayment.roomId.roomName}</Text>
                  </Box>
                  
                  <Box p={4} borderWidth={1} borderRadius="md" bg="gray.50">
                    <Text fontWeight="bold" mb={2}>Chi tiết thanh toán</Text>
                    <Text>Ngày thanh toán: {formatDate(selectedPayment.paymentDate)}</Text>
                    <Text>Phương thức: {selectedPayment.paymentMethod}</Text>
                    <Text>Số tiền: {formatCurrency(selectedPayment.totalAmount)}</Text>
                  </Box>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="teal" onClick={() => setIsOpenDetail(false)}>
                Đóng
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Stack>
    </Container>
  );
}

export default TenantPayments;
