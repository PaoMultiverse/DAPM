import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
  FormErrorMessage,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Flex,
  HStack,
  PinInput,
  PinInputField,
  ModalCloseButton,
  Alert,
  ModalFooter,
  useDisclosure,
  Text,
  Modal,
  AlertIcon,
  IconButton,
} from "@chakra-ui/react";
import axios from "axios";
import { Fa500Px, FaArrowLeft } from "react-icons/fa";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isOtpMessage, setIsOtpMessage] = useState("");
  const [isOtpValid, setIsOtpValid] = useState(true);
  const [canResend, setCanResend] = useState(false);
  const [remainingTime, setRemainingTime] = useState(60);
  const finalRef = React.useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [apiMessage, setApiMessage] = useState("");
  const handleGoBack = () => {
    navigate(-1);
  };
  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (!canResend && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [canResend, remainingTime]);

  // Handle initial request for OTP
  const handleRequestOTP = async () => {
    if (!email) {
      setErrors({ email: "Vui lòng điền email!" });
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API}/auth/forgot-password`,
        { email }
      );
      onOpen(); // Open OTP modal
      setCanResend(false);
      setRemainingTime(60);
      setApiMessage(response.data.message);
      setStep(2);
    } catch (error) {
      setErrors({
        email:
          error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại",
      });
    }
  };

  const handleResendOTP = async () => {
    setCanResend(false);
    setIsOtpValid(true);
    setRemainingTime(60);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API}/auth/resend-otp`,
        { email }
      );
      setIsOtpMessage("Đã gửi lại mã OTP");
    } catch (error) {
      setIsOtpMessage("Lỗi gửi mã OTP");
      setIsOtpValid(false);
    }
  };

  const handleOtpChange = (value) => {
    setOtp(value);
    if (value.length === 6) {
      handleVerifyOTP(value);
    }
  };

  const handleVerifyOTP = async (otpValue = otp) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API}/auth/verify-otp`,
        {
          email,
          verifyOTP: otpValue, // Thay đổi tên field từ 'otp' thành 'verifyOTP'
        }
      );

      if (response.data.success) {
        setIsOtpValid(true);
        setIsOtpMessage("Xác thực OTP thành công");
        onClose();
        setStep(3);
      } else {
        setIsOtpValid(false);
        setIsOtpMessage(response.data.message || "Mã OTP không hợp lệ");
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      setIsOtpValid(false);
      setIsOtpMessage(error.response?.data?.message || "Mã OTP không hợp lệ");
    }
  };

  const handleResetPassword = async () => {
    if (!validateInput()) return;

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API}/auth/reset-password`,
        {
          email: email,
          newPassword: newPassword,
          verifyOTP: otp,
        }
      );

      if (response.data.success) {
        setApiMessage("Đặt lại mật khẩu thành công");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.error("Reset password error:", error.response?.data || error);
      setErrors({
        password:
          error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại",
      });
    }
  };

  const validateInput = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Vui lòng nhập email";
    }
    if (!newPassword) {
      newErrors.password = "Vui lòng nhập mật khẩu mới";
    }
    if (!otp) {
      newErrors.otp = "Vui lòng nhập mã OTP";
    }
    if (newPassword !== confirmNewPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <Box>
      <Text
        textAlign={"center"}
        mt={8}
        marginBlockEnd={4}
        fontSize={{ base: "3xl", md: "xxx-large" }}
        fontWeight="bold"
        bgGradient="linear(to-l, #07c8f9, #0d41e1)"
        bgClip="text"
      >
        Hostel Community
      </Text>
      <Box
        maxWidth="400px"
        mx="auto"
        p={4}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
      >
        <IconButton
          onClick={handleGoBack}
          variant={"ghost"}
          icon={<FaArrowLeft />}
        ></IconButton>
        <Heading textAlign="center" size="md" mb={6} color="blue.600">
          Quên Mật Khẩu
        </Heading>

        <VStack spacing={4} as="form">
          {step === 1 && (
            <>
              <FormControl isRequired isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <Button
                width="100%"
                colorScheme="blue"
                onClick={handleRequestOTP}
              >
                Gửi mã xác thực
              </Button>
            </>
          )}

          {step === 3 && (
            <>
              <FormControl isRequired isInvalid={!!errors.newPassword}>
                <FormLabel>Mật Khẩu Mới</FormLabel>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                />
                <FormErrorMessage>{errors.newPassword}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.confirmNewPassword}>
                <FormLabel>Xác Nhận Mật Khẩu</FormLabel>
                <Input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                />
                <FormErrorMessage>{errors.confirmNewPassword}</FormErrorMessage>
              </FormControl>

              <Button
                width="100%"
                colorScheme="blue"
                onClick={handleResetPassword}
              >
                Đặt lại mật khẩu
              </Button>
            </>
          )}

          {/* OTP Modal */}
          <Modal
            finalFocusRef={finalRef}
            isOpen={isOpen}
            onClose={onClose}
            isCentered
            closeOnOverlayClick={false}
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader textAlign="center">Xác thực mã OTP</ModalHeader>
              <ModalBody textAlign="center">
                <Text mb={4}>
                  Mã OTP đã được gửi tới địa chỉ email của bạn. Vui lòng kiểm
                  tra và nhập mã để xác thực.
                </Text>

                <Flex justifyContent="center" alignItems="center">
                  <HStack>
                    <PinInput
                      otp
                      size="lg"
                      value={otp}
                      onChange={handleOtpChange}
                      isInvalid={!isOtpValid}
                    >
                      <PinInputField />
                      <PinInputField />
                      <PinInputField />
                      <PinInputField />
                      <PinInputField />
                      <PinInputField />
                    </PinInput>
                  </HStack>
                </Flex>

                <Button
                  mt={4}
                  size="sm"
                  variant="outline"
                  onClick={handleResendOTP}
                  isDisabled={!canResend}
                >
                  {canResend ? "Gửi lại OTP" : `Gửi lại sau ${remainingTime}s`}
                </Button>

                {isOtpMessage && (
                  <Alert status={isOtpValid ? "success" : "error"} mt={4}>
                    <AlertIcon />
                    {isOtpMessage}
                  </Alert>
                )}
              </ModalBody>
            </ModalContent>
          </Modal>

          {/* Success/Error Messages */}
          {apiMessage && (
            <Alert status="success" mt={4}>
              <AlertIcon />
              {apiMessage}
            </Alert>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default ForgotPassword;
