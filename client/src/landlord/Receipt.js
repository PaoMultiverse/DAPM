import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Select,
  HStack,
  VStack,
  Stack,
  Heading,
  Spinner,
  useToast,
  Input,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Receipt = () => {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedFacility, setSelectedFacility] = useState("");
  const [searchRoomName, setSearchRoomName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [receipts, setReceipts] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const toast = useToast();
  const token = localStorage.getItem("token");

  // Fetch danh sách cơ sở và hóa đơn khi component mount
  useEffect(() => {
    fetchFacilities();
    fetchReceipts();
  }, [token]);

  // Fetch danh sách cơ sở
  const fetchFacilities = async () => {
    const user = jwtDecode(token);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API}/landlord/hostel`,

        {
          params: {
            landlordId: user.id,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFacilities(response.data.data);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách cơ sở",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Fetch danh sách hóa đơn đã thanh toán
  const fetchReceipts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API}/bills/landlord/paid-bills`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setReceipts(response.data.data);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách thanh toán",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm lọc hóa đơn theo tháng, năm và cơ sở
  const filteredReceipts = receipts.filter((receipt) => {
    if (!selectedMonth && !selectedYear && !selectedFacility) return true;

    const paymentDate = new Date(receipt.paymentDate);
    const paymentMonth = paymentDate.getMonth() + 1;
    const paymentYear = paymentDate.getFullYear();

    const monthMatches = selectedMonth
      ? paymentMonth === parseInt(selectedMonth)
      : true;
    const yearMatches = selectedYear
      ? paymentYear === parseInt(selectedYear)
      : true;

    return monthMatches && yearMatches;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getMonthFromDate = (date) => {
    const paymentDate = new Date(date);
    return `${paymentDate.getMonth() + 1}/${paymentDate.getFullYear()}`;
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
        textColor={"blue.500"}
        as="h3"
        size="lg"
        mb={{ base: 4, md: 12 }}
        textAlign={"center"}
      >
        Danh Sách Thanh Toán
      </Heading>
      <HStack spacing={4} align="center">
        {/* Bộ lọc */}
        <Stack
          direction={{ base: "column", md: "row" }}
          spacing={8}
          align={{ base: "stretch", md: "center" }}
        >
          {/* Tìm kiếm theo tên phòng */}
          <Input
            placeholder="Tìm theo tên phòng"
            value={searchRoomName}
            onChange={(e) => setSearchRoomName(e.target.value)}
          />

          {/* Bộ lọc desktop */}
          <Stack
            direction="row"
            spacing={8}
            align="center"
            display={"flex"}
            w={{ base: "auto", md: "900px" }}
          >
            <Select
              placeholder="Chọn cơ sở"
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
            >
              {facilities.map((facility) => (
                <option key={facility._id} value={facility.name}>
                  {facility.name}
                </option>
              ))}
            </Select>
            <Select
              placeholder="Chọn tháng"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Tháng {i + 1}
                </option>
              ))}
            </Select>
            <Select
              placeholder="Chọn năm"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </Select>
          </Stack>
        </Stack>
      </HStack>
      {filteredReceipts.length > 0 ? (
        <Table variant="striped" colorScheme="blue" mt={4}>
          <Thead>
            <Tr>
              <Th>Cơ Sở</Th>
              <Th>Tên Phòng</Th>
              <Th>Số Tiền Đã Thanh Toán</Th>
              <Th>Tháng</Th>
              <Th>Ngày Thanh Toán</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredReceipts.map((receipt) => (
              <Tr key={receipt._id}>
                <Td>{receipt.roomId.hostelId.name}</Td>
                <Td>{receipt.roomId.roomName}</Td>
                <Td>{formatCurrency(receipt.totalAmount)}</Td>
                <Td>{getMonthFromDate(receipt.paymentDate)}</Td>
                <Td>
                  {new Date(receipt.paymentDate).toLocaleDateString("vi-VN")}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <Text fontSize="lg" color="gray.500" textAlign="center" w="100%" mt={4}>
          Không có dữ liệu
        </Text>
      )}
    </Box>
  );
};

export default Receipt;
