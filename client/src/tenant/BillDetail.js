import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  VStack,
  Heading,
  Text,
  Button,
  Container,
  Badge,
  Divider,
  HStack,
  Box,
  useToast,
  Image,
} from "@chakra-ui/react";
import { FaArrowLeft } from "react-icons/fa";
import { PayPalButtons } from "@paypal/react-paypal-js";

const getErrorMessage = (errorCode) => {
  switch (errorCode) {
    case "invalid_signature":
      return "Chữ ký không hợp lệ";
    case "bill_not_found":
      return "Không tìm thấy hóa đơn";
    case "server_error":
      return "Lỗi hệ thống";
    case "24":
      return "Giao dịch không thành công";
    case "09":
      return "Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng";
    case "10":
      return "Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần";
    case "11":
      return "Đã hết hạn chờ thanh toán";
    case "12":
      return "Thẻ/Tài khoản của khách hàng bị khóa";
    case "13":
      return "Khách hàng nhập sai mật khẩu xác thực giao dịch";
    case "51":
      return "Tài khoản không đủ số dư để thực hiện giao dịch";
    case "65":
      return "Tài khoản của quý khách đã vượt quá hạn mức giao dịch trong ngày";
    case "75":
      return "Ngân hàng thanh toán đang bảo trì";
    case "79":
      return "KH nhập sai mật khẩu thanh toán quá số lần quy định";
    default:
      return "Giao dịch thất bại";
  }
};

const BillDetail = () => {
  const [bill, setBill] = useState(null);
  const { billId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const checkPaymentResult = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const vnp_ResponseCode = urlParams.get("vnp_ResponseCode");
    const vnp_TxnRef = urlParams.get("vnp_TxnRef");

    console.log("Payment result check:", { vnp_ResponseCode, vnp_TxnRef });

    if (vnp_ResponseCode === "00" && vnp_TxnRef) {
      try {
        // Gọi API để cập nhật trạng thái bill
        const response = await axios.get(
          `${process.env.REACT_APP_API}/payment/vnpay/callback`,
          {
            params: {
              vnp_ResponseCode,
              vnp_TxnRef,
              ...Object.fromEntries(urlParams),
            },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.success) {
          toast({
            title: "Thanh toán thành công",
            description: "Hóa đơn đã được thanh toán thành công",
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top",
          });
          navigate("/tenant/bills", { replace: true });
        } else {
          throw new Error(response.data.message);
        }
      } catch (error) {
        console.error("Error processing payment:", error);
        toast({
          title: "Lỗi xử lý thanh toán",
          description:
            error.response?.data?.message ||
            "Vui lòng kiểm tra lại trạng thái thanh toán",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
        navigate("/tenant/bills", { replace: true });
      }
    } else {
      toast({
        title: "Thanh toán thất bại",
        description: "Giao dịch không thành công",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      navigate("/tenant/bills", { replace: true });
    }
  };

  useEffect(() => {
    // Chỉ fetch bill details khi không phải là payment-result
    if (billId !== "payment-result") {
      fetchBillDetails();
    } else {
      checkPaymentResult();
    }
  }, [billId]);

  const fetchBillDetails = async () => {
    try {
      // Kiểm tra nếu billId là 'payment-result' thì bỏ qua
      if (billId === "payment-result") {
        return;
      }
      const response = await axios.get(
        `${process.env.REACT_APP_API}/bills/${billId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setBill(response.data.data);
    } catch (error) {
      console.error("Error fetching bill:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin hóa đơn",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "orange";
      case "PAID":
        return "green";
      case "OVERDUE":
        return "red";
      default:
        return "gray";
    }
  };

  const handleVNPayPayment = async () => {
    try {
      setIsProcessing(true);

      // Format amount - phải là số nguyên, đơn vị là VND * 100
      const amount = Math.round(bill.totalAmount * 100);

      const response = await axios.post(
        `${process.env.REACT_APP_API}/payment/vnpay/create`,
        {
          billId: bill._id,
          amount: amount,
          orderDescription: `Thanh toan hoa don #${bill._id}`,
          language: "vn",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      if (response.data.success) {
        // Lưu thông tin thanh toán vào localStorage để kiểm tra sau
        localStorage.setItem("lastPaymentBillId", bill._id);
        localStorage.setItem("lastPaymentTimestamp", Date.now().toString());

        // Chuyển hướng đến trang thanh toán VNPAY
        window.location.href = response.data.paymentUrl;
      } else {
        throw new Error(
          response.data.message || "Không thể tạo URL thanh toán"
        );
      }
    } catch (error) {
      console.error("VNPAY payment error:", error);
      toast({
        title: "Lỗi thanh toán",
        description:
          error.code === "ECONNABORTED"
            ? "Yêu cầu thanh toán đã hết thời gian"
            : error.response?.data?.message || "Không thể tạo thanh toán VNPAY",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVNPayCallback = async (params) => {
    try {
      console.log("Sending callback params:", params);
      const response = await axios.get(
        `${process.env.REACT_APP_API}/bills/${params.vnp_TxnRef}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setBill(response.data.data);
        toast({
          title: "Thanh toán thành công",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        navigate("/tenant/bills", { replace: true });
      }
    } catch (error) {
      console.error("VNPAY callback error:", error);
      toast({
        title: "Lỗi xử lý thanh toán",
        description:
          error.response?.data?.message ||
          "Vui lòng kiểm tra lại trạng thái thanh toán",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      navigate("/tenant/bills", { replace: true });
    }
  };

  return (
    <Container maxW="container.md" py={5}>
      <Button
        leftIcon={<FaArrowLeft />}
        onClick={() => navigate("/tenant/bills")}
        mb={4}
      >
        Quay lại
      </Button>

      <VStack
        spacing={4}
        align="stretch"
        borderWidth={1}
        borderRadius="lg"
        p={6}
      >
        <Heading size="lg">Chi tiết hóa đơn</Heading>
        {bill && (
          <>
            <HStack justify="space-between">
              <Text fontWeight="bold">Phòng:</Text>
              <Text>{bill.roomId.roomName}</Text>
            </HStack>

            <HStack justify="space-between">
              <Text fontWeight="bold">Trạng thái:</Text>
              <Badge colorScheme={getStatusColor(bill.status)}>
                {bill.status === "PENDING"
                  ? "Chờ thanh toán"
                  : bill.status === "PAID"
                  ? "Đã thanh toán"
                  : bill.status === "OVERDUE"
                  ? "Quá hạn"
                  : "Không xác định"}
              </Badge>
            </HStack>

            <Divider />

            <Box>
              <Text fontWeight="bold" mb={2}>
                Chi tiết thanh toán:
              </Text>
              <VStack align="stretch" pl={4}>
                <HStack justify="space-between">
                  <Text>Tiền phòng:</Text>
                  <Text>{formatCurrency(bill.rentFee)}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text>Tiền điện:</Text>
                  <Text>{formatCurrency(bill.electricityFee)}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text>Tiền nước:</Text>
                  <Text>{formatCurrency(bill.waterFee)}</Text>
                </HStack>
                {bill.serviceFee > 0 && (
                  <HStack justify="space-between">
                    <Text>Phí dịch vụ:</Text>
                    <Text>{formatCurrency(bill.serviceFee)}</Text>
                  </HStack>
                )}
              </VStack>
            </Box>

            <Divider />

            <HStack justify="space-between" fontWeight="bold">
              <Text>Tổng cộng:</Text>
              <Text>{formatCurrency(bill.totalAmount)}</Text>
            </HStack>

            <HStack justify="space-between">
              <Text>Hạn thanh toán:</Text>
              <Text>{new Date(bill.dueDate).toLocaleDateString("vi-VN")}</Text>
            </HStack>

            {(bill.status === "PENDING" || bill.status === "OVERDUE") && (
              <VStack spacing={4} width="100%" mt={4}>
                <Box width="100%">
                  <PayPalButtons
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [
                          {
                            amount: {
                              value: (bill.totalAmount / 24000).toFixed(2),
                              currency_code: "USD",
                            },
                            description: `Thanh toán hóa đơn #${bill._id}`,
                          },
                        ],
                      });
                    }}
                    onApprove={async (data, actions) => {
                      try {
                        const response = await axios.get(
                          `${process.env.REACT_APP_API}/payment/paypal/success`,
                          {
                            params: {
                              token: data.orderID,
                              billId: bill._id,
                            },
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem(
                                "token"
                              )}`,
                            },
                          }
                        );

                        if (response.data.success) {
                          await fetchBillDetails();
                          toast({
                            title: "Thanh toán thành công",
                            status: "success",
                            duration: 3000,
                            isClosable: true,
                          });
                          navigate("/tenant/bills", { replace: true });
                        }
                      } catch (error) {
                        console.error("PayPal payment error:", error);
                        toast({
                          title: "Lỗi xử lý thanh toán",
                          description:
                            error.response?.data?.message ||
                            "Vui lòng liên hệ admin",
                          status: "error",
                          duration: 3000,
                          isClosable: true,
                        });
                        navigate("/tenant/bills", {
                          replace: true,
                          state: { payment: "failed" },
                        });
                      }
                    }}
                    onError={() => {
                      toast({
                        title: "Lỗi thanh toán",
                        description: "Vui lòng thử lại sau",
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                      });
                    }}
                  />
                </Box>

                <Button
                  colorScheme="green"
                  size="lg"
                  width="100%"
                  leftIcon={<Image src="/vnpay-logo.png" boxSize="24px" />}
                  onClick={handleVNPayPayment}
                  isDisabled={isProcessing}
                >
                  Thanh toán qua VNPAY
                </Button>
              </VStack>
            )}
          </>
        )}
      </VStack>
    </Container>
  );
};

export default BillDetail;
