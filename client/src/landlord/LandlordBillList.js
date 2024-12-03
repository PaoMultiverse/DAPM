import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  Box,
  Spinner,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Select,
  HStack,
  Heading,
  Center
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import axios from 'axios';

const LandlordBillList = () => {
  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterHostel, setFilterHostel] = useState('all');
  const toast = useToast();

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API}/bills/landlord/bills`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setBills(response.data.data);
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể tải danh sách hóa đơn",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'orange';
      case 'PAID': return 'green';
      case 'OVERDUE': return 'red';
      default: return 'gray';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const hostels = useMemo(() => {
    const hostelSet = new Set();
    bills.forEach(bill => {
      if (bill.roomId?.hostelId) {
        hostelSet.add(JSON.stringify({
          id: bill.roomId.hostelId._id,
          name: bill.roomId.hostelId.name
        }));
      }
    });
    return Array.from(hostelSet).map(hostel => JSON.parse(hostel));
  }, [bills]);

  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      const matchesSearch = 
        bill.roomId.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.tenantId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.roomId.hostelId.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || bill.status === filterStatus;
      
      const matchesHostel = filterHostel === 'all' || 
        bill.roomId.hostelId._id === filterHostel;

      return matchesSearch && matchesStatus && matchesHostel;
    });
  }, [bills, searchTerm, filterStatus, filterHostel]);

  return (
    <Container maxW="container.xl" py={5}>
      <Stack spacing={5}>
        <Heading size="lg">Danh sách hóa đơn</Heading>
        
        <Stack spacing={4} direction={{ base: "column", md: "row" }}>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Tìm kiếm theo tên phòng, người thuê..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          
          <Select
            maxW="250px"
            value={filterHostel}
            onChange={(e) => setFilterHostel(e.target.value)}
          >
            <option value="all">Tất cả cơ sở</option>
            {hostels.map(hostel => (
              <option key={hostel.id} value={hostel.id}>
                {hostel.name}
              </option>
            ))}
          </Select>
          
          <Select
            maxW="200px"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="PENDING">Chờ thanh toán</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="OVERDUE">Quá hạn</option>
          </Select>
        </Stack>

        <Text fontSize="sm" color="gray.600">
          Tìm thấy {filteredBills.length} hóa đơn
        </Text>

        {isLoading ? (
          <Center>
            <Spinner />
          </Center>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Cơ sở</Th>
                  <Th>Phòng</Th>
                  <Th>Người thuê</Th>
                  <Th>Ngày tạo</Th>
                  <Th>Tổng tiền</Th>
                  <Th>Trạng thái</Th>
                  <Th>Hạn thanh toán</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredBills.map(bill => (
                  <Tr key={bill._id}>
                    <Td>{bill.roomId.hostelId.name}</Td>
                    <Td>{bill.roomId.roomName}</Td>
                    <Td>{bill.tenantId.name}</Td>
                    <Td>{new Date(bill.createdAt).toLocaleDateString('vi-VN')}</Td>
                    <Td>{formatCurrency(bill.totalAmount)}</Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(bill.status)}>
                        {bill.status === 'PENDING' ? 'Chờ thanh toán' : 
                         bill.status === 'PAID' ? 'Đã thanh toán' : 'Quá hạn'}
                      </Badge>
                    </Td>
                    <Td>{new Date(bill.dueDate).toLocaleDateString('vi-VN')}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Stack>
    </Container>
  );
};

export default LandlordBillList; 