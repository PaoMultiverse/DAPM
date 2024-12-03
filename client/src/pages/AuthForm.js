import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Button,
  Stack,
  Text,
  Flex,
  Radio,
  RadioGroup,
  Alert,
  AlertIcon,
  useDisclosure,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalOverlay,
  HStack,
  PinInput,
  PinInputField,
} from "@chakra-ui/react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const AuthForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const finalRef = React.useRef(null);
  const [signinIn, setSigninIn] = useState(location.pathname === "/login");

  const [loginFormData, setLoginFormData] = useState({
    email: "",
    password: "",
  });

  const [registerFormData, setRegisterFormData] = useState({
    name: "",
    numPhone: "",
    email: "",
    gender: "",
    role: "tenant",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState(false);
  const [isLogInError, setIsLogInError] = useState(false);
  const [isOtpMessage, setIsOtpMessage] = useState("");

  const [apiMessage, setApiMessage] = useState("");
  const [apiLogInMessage, setApiLogInMessage] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpValid, setIsOtpValid] = useState(true); // To track if the OTP is valid
  const [canResend, setCanResend] = useState(false);
  const [remainingTime, setRemainingTime] = useState(60);
  useEffect(() => {
    setSigninIn(location.pathname === "/login");

    // Load saved formData from localStorage
    const savedFormData = JSON.parse(localStorage.getItem("formData"));

    if (savedFormData) {
      if (signinIn) {
        // For login
        setLoginFormData(savedFormData);
      } else {
        // For register
        setRegisterFormData(savedFormData);
      }
    }
  }, [location.pathname, signinIn]);
  useEffect(() => {
    if (!canResend) {
      const timer = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime === 1) {
            setCanResend(true);
            clearInterval(timer);
            return 60;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer); // Clean up timer on component unmount
    }
  }, [canResend]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (signinIn) {
      // Update login form data
      const updatedLoginData = { ...loginFormData, [name]: value };
      setLoginFormData(updatedLoginData);
      localStorage.setItem("formData", JSON.stringify(updatedLoginData));
    } else {
      // Update register form data
      const updatedRegisterData = { ...registerFormData, [name]: value };
      setRegisterFormData(updatedRegisterData);
      localStorage.setItem("formData", JSON.stringify(updatedRegisterData));
    }
  };

  const handleFormToggle = () => {
    setSigninIn((prev) => !prev);
    console.log("SigninIn toggled:", !signinIn);
    if (signinIn) {
      navigate("/register");
    } else {
      navigate("/login");
    }

    setErrors({});
    if (signinIn) {
      setRegisterFormData({
        name: "",
        numPhone: "",
        email: "",
        gender: "",
        role: "tenant",
        password: "",
        confirmPassword: "",
      });
    } else {
      setLoginFormData({
        email: "",
        password: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (signinIn) {
      // Validate login form
      if (!loginFormData.email) newErrors.email = "Vui lòng điền Email!";
      if (!loginFormData.password)
        newErrors.password = "Vui lòng điền mật khẩu!";
    } else {
      // Validate register form
      if (!registerFormData.name) newErrors.name = "Vui lòng điền tên!";
      if (!registerFormData.numPhone)
        newErrors.numPhone = "Vui lòng điền số điện thoại!";
      if (!registerFormData.gender)
        newErrors.gender = "Vui lòng nhập giới tính";
      if (!registerFormData.email) newErrors.email = "Vui lòng điền email!";
      if (!registerFormData.password)
        newErrors.password = "Vui lòng điền mật khẩu!";
      if (registerFormData.password !== registerFormData.confirmPassword) {
        newErrors.confirmPassword = "Mật khẩu không khớp.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginComplete = (e) => {
    const role = e;

    if (role === "tenant") {
      navigate(`/tenant`);
    } else if (role === "landlord" || role === "manager") {
      navigate(`/landlord`);
    } else if (role === "admin") {
      navigate("/admin");
    }
    onClose();
  };

  const handleLogin = async () => {
    if (validateForm()) {
      const email = loginFormData.email;
      const password = loginFormData.password;

      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API}/auth/login`,
          {
            email: email,
            password: password,
          }
        );

        const token = response.data.token;

        const user = jwtDecode(token);
        console.log(user);
        localStorage.setItem("token", token);
        localStorage.setItem("role", user.role);

        handleLoginComplete(user.role);

        setApiLogInMessage("Đăng nhập thành công");
        setIsLogInError(false);
      } catch (error) {
        console.log(error);
        setApiLogInMessage(error.response.data.message);
        setIsLogInError(true);
      }
    }
  };

  const handleRegister = async () => {
    if (validateForm()) {
      const data = new FormData();
      data.append("name", registerFormData.name);
      data.append("email", registerFormData.email);
      data.append("numPhone", registerFormData.numPhone);
      data.append("gender", registerFormData.gender);
      data.append("role", registerFormData.role);
      data.append("password", registerFormData.password);

      console.log("Sending data:", {
        name: registerFormData.name,
        email: registerFormData.email,
        numPhone: registerFormData.numPhone,
        gender: registerFormData.gender,
        role: registerFormData.role,
        password: registerFormData.password,
      });

      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API}/auth/register`,
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("Response:", response.data);
        onOpen();
        setApiMessage("Tạo tài khoản thành công!");
        setIsError(false);
      } catch (error) {
        console.error(
          "Registration error:",
          error.response?.data || error.message
        );
        setApiMessage(error.response?.data?.message || "Đã xảy ra lỗi");
        setIsError(true);
      }
    }
  };

  const handleResendOTP = async () => {
    setCanResend(false);
    setIsOtpValid("true");
    try {
      const email = registerFormData.email;
      const response = await axios.post(
        `${process.env.REACT_APP_API}/auth/resend-otp`,
        { email: email }
      );
      console.log(response.data);
    } catch (error) {
      console.log(error);
      setIsOtpMessage("Lỗi gửi mã otp");
    }
  };

  const handleOtpChange = (value) => {
    setOtp(value);
  };

  const handleVerifyOTP = async () => {
    const emailData = registerFormData.email;
    const otpData = otp;
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API}/auth/verify-otp`,
        {
          email: emailData,
          verifyOTP: otpData,
        }
      );
      setIsOtpValid("true");
      setIsOtpMessage("");
      setApiMessage("Xác thực email thành công");
      onClose();
      console.log(response.data);
    } catch (error) {
      setIsOtpValid("false");
      setIsOtpMessage(error.response.data.message);
      console.error(error);
    }
  };
  const handleKeyDown = (event) => {
    console.log("Key pressed:", event.key);
    if (event.key === "Enter") {
      if (signinIn) {
        handleLogin();
      } else {
        handleRegister();
      }
    }
  };

  return (
    <Flex
      bg="white"
      height="fit-content"
      align="center"
      justify="center"
      p={{ base: 2, md: 8 }}
      flexDirection={{ base: "column", lg: "row" }}
    >
      {/* left content */}
      <Box
        position="relative"
        overflow="hidden"
        flex="5"
        height="fit-content"
        textAlign="center"
        display="flex"
        flexDirection="column"
        alignItems="center"
        mr={{ base: 0, lg: 6 }}
        mb={{ base: 6, lg: 0 }}
      >
        <Box
          as={"section"}
          display={{ base: "none", md: "block" }}
          sx={{
            transition: "transform 0.4s ease-in-out",
            _hover: {
              transform: "scale(1.1)",
              backgroundImage: `url("../eco-house-color.png")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            },
          }}
        >
          <img src="../eco-house-black.png" alt="Eco Green" width="100%" />
        </Box>
        <Text
          mt={{ base: 0, md: 4 }}
          fontSize={{ base: "3xl", md: "xxx-large" }}
          fontWeight="bold"
          bgGradient="linear(to-l, #07c8f9, #0d41e1)"
          bgClip="text"
        >
          Hostel Community
        </Text>
      </Box>

      <Box
        borderRadius="10px"
        boxShadow="dark-lg"
        position="relative"
        overflow="hidden"
        width={{ base: "100%", md: "80%", lg: "800px" }}
        maxWidth="90%"
        minHeight="650px"
        flex="5"
      >
        <Flex
          position="absolute"
          top="0"
          left="0"
          right="0"
          width="100%"
          height={{ base: "fit-content", md: "100%" }}
          flexDirection={{ base: "column", md: "row" }}
        >
          {/* Sign In Form */}
          <Box
            as="form"
            onKeyDown={handleKeyDown}
            alignContent={"center"}
            position="absolute"
            left={
              signinIn
                ? { base: "0", md: "50%" }
                : { base: "-100%", md: "-100%" }
            }
            right={signinIn ? "0" : "200%"}
            transition="all 0.8s cubic-bezier(0.65, 0.05, 0.36, 1)"
            width={{ base: "100%", md: "50%" }}
            height={{ base: "fit-content", md: "100%" }}
            p={6}
            opacity={signinIn ? 1 : 0}
            zIndex={signinIn ? 2 : 1}
          >
            <Heading textAlign={"center"} size="lg" mb={6} color="blue.600">
              Đăng Nhập
            </Heading>
            <>
              <FormControl
                variant="floating"
                isRequired
                isInvalid={!!errors.email}
                mb={4}
              >
                <Input
                  color={"black"}
                  name="email"
                  type="email"
                  placeholder=" "
                  value={loginFormData.email}
                  onChange={handleInputChange}
                />
                <FormLabel textColor={"black"}>Email</FormLabel>
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl
                variant="floating"
                isRequired
                isInvalid={!!errors.password}
                mb={4}
              >
                <Input
                  color={"black"}
                  name="password"
                  type="password"
                  placeholder=" "
                  value={loginFormData.password}
                  onChange={handleInputChange}
                />
                <FormLabel textColor={"black"}>Mật khẩu</FormLabel>
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>
            </>
            {/* Display API Error Message */}
            {apiLogInMessage && (
              <Alert
                status={isLogInError ? "error" : "success"}
                borderRadius={6}
              >
                <AlertIcon />
                {apiLogInMessage}
              </Alert>
            )}
            <Button
              textColor={"white"}
              bgGradient="linear(to-r, #07c8f9, #0d41e1)"
              _hover={{ bgGradient: "linear(to-l, #07c8f9, #0d41e1)" }}
              width="100%"
              mt={2}
              onClick={handleLogin}
            >
              Đăng Nhập
            </Button>
            <Text
              textColor={"brand.500"}
              textAlign={"center"}
              onClick={handleFormToggle}
              display={{ base: "block", md: "none" }}
              cursor={"pointer"}
              mt={2}
            >
              Chưa có tài khoản? Đăng ký tại đây
            </Text>
            <Flex
              fontWeight={"semibold"}
              textColor={"brand.700"}
              mt={3}
              justifyContent="flex-end"
              width="100%"
            >
              <NavLink to={`/forgot-password`}>Quên mật khẩu?</NavLink>
            </Flex>
          </Box>
          {/* Sign Up Form */}
          <Box
            as="form"
            onKeyDown={handleKeyDown}
            alignContent={"center"}
            position="absolute"
            left={signinIn ? "100%" : "0"}
            transition="all 0.8s cubic-bezier(0.65, 0.05, 0.36, 1)"
            width={{ base: "100%", md: "50%" }}
            height="100%"
            p={4}
            opacity={!signinIn ? 1 : 0}
            zIndex={!signinIn ? 2 : 1}
          >
            <Heading
              textAlign={"center"}
              size="lg"
              mb={6}
              color="blue.600"
              onClick={onOpen}
            >
              Đăng Ký
            </Heading>

            <>
              {/* Form Fields */}
              <FormControl
                variant="floating"
                isRequired
                isInvalid={!!errors.name}
                mb={4}
              >
                <Input
                  name="name"
                  type="text"
                  placeholder=" "
                  value={registerFormData.name}
                  onChange={handleInputChange}
                />
                <FormLabel textColor={"black"}>Tên</FormLabel>
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              <FormControl
                variant="floating"
                isRequired
                isInvalid={!!errors.phone}
                mb={4}
              >
                <Input
                  name="numPhone"
                  type="tel"
                  placeholder=" "
                  value={registerFormData.numPhone}
                  onChange={handleInputChange}
                />
                <FormLabel textColor={"black"}>Số điện thoại</FormLabel>
                <FormErrorMessage>{errors.phone}</FormErrorMessage>
              </FormControl>

              <FormControl
                variant="floating"
                isRequired
                isInvalid={!!errors.email}
                mb={4}
              >
                <Input
                  name="email"
                  type="email"
                  placeholder=" "
                  value={registerFormData.email}
                  onChange={handleInputChange}
                />
                <FormLabel textColor={"black"}>Email</FormLabel>
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.gender} mb={4}>
                <FormLabel textColor={"black"}>Giới tính</FormLabel>
                <RadioGroup
                  name="gender"
                  value={registerFormData.gender}
                  onChange={(value) =>
                    setRegisterFormData({ ...registerFormData, gender: value })
                  }
                >
                  <Stack textColor={"black"} direction="row">
                    <Radio value="male">Nam</Radio>
                    <Radio value="female">Nữ</Radio>
                  </Stack>
                </RadioGroup>
                <FormErrorMessage>{errors.gender}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.role} mb={4}>
                <FormLabel textColor={"black"}>Bạn là</FormLabel>
                <RadioGroup
                  name="role"
                  value={registerFormData.role}
                  onChange={(value) =>
                    setRegisterFormData({ ...registerFormData, role: value })
                  }
                >
                  <Stack textColor={"black"} direction="row">
                    <Radio value="tenant">Khách thuê phòng</Radio>
                    <Radio value="landlord">Chủ nhà</Radio>
                  </Stack>
                </RadioGroup>
                <FormErrorMessage>{errors.role}</FormErrorMessage>
              </FormControl>

              <FormControl
                variant="floating"
                isRequired
                isInvalid={!!errors.password}
                mb={4}
              >
                <Input
                  name="password"
                  type="password"
                  placeholder=" "
                  value={registerFormData.password}
                  onChange={handleInputChange}
                />
                <FormLabel textColor={"black"}>Mật khẩu</FormLabel>
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>

              <FormControl
                variant="floating"
                isRequired
                isInvalid={!!errors.confirmPassword}
                mb={4}
              >
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder=" "
                  value={registerFormData.confirmPassword}
                  onChange={handleInputChange}
                />
                <FormLabel textColor={"black"}>Nhập lại mật khẩu</FormLabel>
                <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
              </FormControl>
            </>
            {/* Display API Error Message */}
            {apiMessage && (
              <Alert status={isError ? "error" : "success"} borderRadius={6}>
                <AlertIcon />
                {apiMessage}
              </Alert>
            )}
            {/* Submit Button */}
            <Button
              textColor={"white"}
              bgGradient="linear(to-r, #07c8f9, #0d41e1)"
              _hover={{ bgGradient: "linear(to-l, #07c8f9, #0d41e1)" }}
              width="100%"
              mt={2}
              onClick={() => {
                handleRegister();
              }}
            >
              Đăng Ký
            </Button>
            <Text
              textColor={"brand.500"}
              textAlign={"center"}
              onClick={handleFormToggle}
              display={{ base: "block", md: "none" }}
              cursor={"pointer"}
              mt={2}
            >
              Đã có tài khoản? Đăng nhập tại đây
            </Text>
            {/* OTP */}
            <Modal
              finalFocusRef={finalRef}
              isOpen={isOpen}
              onClose={onClose}
              isCentered
              size="lg"
            >
              <ModalOverlay />
              <ModalContent>
                <ModalHeader
                  textColor={"brand.700"}
                  textAlign="center"
                  fontWeight="bold"
                  fontSize="xl"
                >
                  Xác thực mã OTP
                </ModalHeader>
                <ModalBody textAlign="center">
                  <Text mb={4}>
                    Mã OTP đã được gửi tới địa chỉ email của bạn. Vui lòng kiểm
                    tra hộp thư và nhập mã để xác thực.
                  </Text>

                  <Flex justifyContent="center" alignItems="center">
                    <HStack>
                      <PinInput
                        otp
                        size="lg"
                        placeholder=""
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
                    <Button
                      ml={4}
                      size="sm"
                      variant={"outline"}
                      colorScheme="blue"
                      onClick={handleResendOTP}
                      isDisabled={!canResend}
                    >
                      {canResend ? "Gửi lại OTP" : ` ${remainingTime}s`}
                    </Button>
                  </Flex>

                  <ModalCloseButton />
                  {/* Display API Error Message */}
                  {isOtpMessage && (
                    <Alert
                      status={isOtpValid ? "error" : "success"}
                      borderRadius={6}
                      mt={6}
                    >
                      <AlertIcon />
                      {isOtpMessage}
                    </Alert>
                  )}
                </ModalBody>
                <ModalFooter justifyContent="space-between">
                  <Button colorScheme="red" onClick={onClose}>
                    Hủy
                  </Button>

                  <Button colorScheme="green" onClick={handleVerifyOTP}>
                    Xác nhận
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </Box>
        </Flex>

        {/* Overlay Panel */}
        <Box
          zIndex={8}
          position="absolute"
          top="0"
          left="50%"
          width="50%"
          height="100%"
          transition="all 0.8s cubic-bezier(0.65, 0.05, 0.36, 1)"
          transform={signinIn ? "translateX(-100%)" : "translateX(0)"}
          bgGradient={"linear(to-r, #0968e5, #091970)"}
          color="white"
          p={8}
          display={{ base: "none", md: "flex" }}
          alignItems="center"
          justifyContent="center"
          textAlign="center"
        >
          <Stack spacing={6}>
            <Heading size="md">
              {signinIn ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
            </Heading>
            <Text textColor={"brand.0"}>
              {signinIn
                ? "Hãy đăng ký để có thể sử dụng dịch vụ của chúng tôi."
                : "Hãy đăng nhập để sử dụng dịch vụ của chúng tôi."}
            </Text>
            <Button
              variant="outline"
              colorScheme="blue"
              textColor="white"
              _hover={{ textColor: "blue.600", bg: "brand.0" }}
              onClick={handleFormToggle}
            >
              {signinIn ? "Đăng Ký" : "Đăng Nhập"}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Flex>
  );
};

export default AuthForm;
