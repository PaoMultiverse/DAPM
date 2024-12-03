import React, { useState, useEffect } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Container,
  Text,
  Flex
} from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';

const BillList = () => {
  const [bills, setBills] = useState([]);
  const navigate = useNavigate();
  const toast = useToast();
  const location = useLocation();

  useEffect(() => {
    fetchBills();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const errorCode = urlParams.get('error') || urlParams.get('code');
    
    if (paymentStatus === 'success') {
        toast({
            title: "Thanh toán thành công",
            description: "Hóa đơn đã được thanh toán thành công",
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top"
        });
    } else if (paymentStatus === 'failed') {
        toast({
            title: "Thanh toán thất bại", 
            description: getErrorMessage(errorCode),
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top"
        });
    }
  }, []);

  const fetchBills = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API}/bills`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setBills(response.data.data);
    } catch (error) {
      console.error('Error fetching bills:', error);
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

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'invalid_signature':
        return 'Chữ ký không hợp lệ';
      case 'bill_not_found':
        return 'Không tìm thấy hóa đơn';
      default:
        return 'Có lỗi xảy ra khi thanh toán';
    }
  };

  return (
    <Container maxW="container.xl" py={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Text fontSize="2xl" fontWeight="bold">Danh sách hóa đơn</Text>
      </Flex>

      <Table variant="simple">
        <Thead bg="cyan.100">
          <Tr>
            <Th>Phòng</Th>
            <Th>Ngày tạo</Th>
            <Th>Tiền phòng</Th>
            <Th>Tiền điện</Th>
            <Th>Tiền nước</Th>
            <Th>Tổng tiền</Th>
            <Th>Trạng thái</Th>
            <Th>Hạn thanh toán</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {bills.map(bill => (
            <Tr key={bill._id}>
              <Td>{bill.roomId.roomName}</Td>
              <Td>{new Date(bill.createdAt).toLocaleDateString('vi-VN')}</Td>
              <Td>{formatCurrency(bill.rentFee)}</Td>
              <Td>{formatCurrency(bill.electricityFee)}</Td>
              <Td>{formatCurrency(bill.waterFee)}</Td>
              <Td>{formatCurrency(bill.totalAmount)}</Td>
              <Td>
                <Badge colorScheme={getStatusColor(bill.status)}>
                  {bill.status === 'PENDING' ? 'Chờ thanh toán' : 
                   bill.status === 'PAID' ? 'Đã thanh toán' : 'Quá hạn'}
                </Badge>
              </Td>
              <Td>{new Date(bill.dueDate).toLocaleDateString('vi-VN')}</Td>
              <Td>
                <Button
                  colorScheme="blue"
                  size="sm"
                  onClick={() => navigate(`/tenant/bills/${bill._id}`)}
                >
                  Chi tiết
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Container>
  );
};

export default BillList; 