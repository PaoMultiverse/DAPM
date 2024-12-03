import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Image,
  IconButton,
  Container,
} from "@chakra-ui/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Banner = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const bannerImages = [
    // './house-banner.png',
    "./houses/house1lg.png",
    "./houses/house2lg.png",
    "./houses/house3lg.png",
    "./houses/house4lg.png",
    "./houses/house5lg.png",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex(handleImageTransition());
    }, 5000);
    return () => clearInterval(timer);
  }, [currentImageIndex]);

  const handleImageTransition = () => {
    return currentImageIndex === bannerImages.length - 1
      ? 0
      : currentImageIndex + 1;
  };

  return (
    <Container maxW="container.xl" px={{ base: 4, lg: 0 }}>
      <Box
        maxH={{ base: "auto", lg: "640px" }}
        mb={{ base: 8, xl: 24 }}
        position={{ base: "relative", lg: "static" }}
      >
        <Flex
          direction={{ base: "column", lg: "row" }}
          gap={{ base: 6, lg: 0 }}
        >
          {/* Text Content */}
          <Flex
            direction="column"
            alignItems={{ base: "center", lg: "flex-start" }}
            textAlign={{ base: "center", lg: "left" }}
            justifyContent="center"
            flex="2"
            px={{ base: 4, lg: 0 }}
            ml={{ lg: 8, xl: "135px" }}
            bgColor="none"
            order={{ base: 2, lg: 0 }}
            position={{ base: "relative", lg: "static" }}
            zIndex={{ base: 2, lg: "auto" }}
          >
            <Heading
              fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
              fontWeight="semibold"
              mb={6}
              lineHeight="none"
              transition="all 0.5s"
              _hover={{
                transform: "translateY(-8px)",
              }}
            >
              <Text
                bgGradient="linear(to-l, #07c8f9, #0d41e1)"
                bgClip="text"
                mb={2}
              >
                Hostel Community
              </Text>
              ngôi nhà trong mơ của bạn
            </Heading>
            <Text
              maxW="480px"
              mb={8}
              fontSize={{ base: "lg", xl: "xl" }}
              fontWeight="medium"
              textAlign="justify"
              lineHeight="tall"
              letterSpacing="wide"
              transition="all 0.5s"
              _hover={{
                transform: "translateY(-8px)",
              }}
              sx={{
                textJustify: "inter-word",
              }}
            >
              Khám phá hàng nghìn phòng trọ chất lượng với đầy đủ tiện nghi.
              Chúng tôi cam kết mang đến cho bạn trải nghiệm tìm kiếm và thuê
              phòng an toàn, tiện lợi với giá cả hợp lý nhất.
            </Text>
          </Flex>

          {/* Image Slider */}
          <Box
            display="flex"
            flex="1"
            position={{ base: "absolute", lg: "relative" }}
            overflow="hidden"
            h={{ base: "100%", md: "400px", lg: "auto" }}
            order={{ base: 1, lg: 1 }}
            top={{ base: 0, lg: "auto" }}
            left={{ base: 0, lg: "auto" }}
            right={{ base: 0, lg: "auto" }}
            bottom={{ base: 0, lg: "auto" }}
            zIndex={{ base: 1, lg: "auto" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0, scale: 1.1 }} // Thay đổi từ x sang scale để tạo hiệu ứng phóng to
                animate={{ opacity: 1, scale: 1 }} // Trở về kích thước ban đầu
                exit={{ opacity: 0, scale: 0.9 }} // Giảm kích thước khi thoát
                transition={{ duration: 0.5, ease: "easeInOut" }} // Thêm ease để mượt mà hơn
                style={{ width: "100%", height: "100%" }}
              >
                <Image
                  src={bannerImages[currentImageIndex]}
                  alt=""
                  w="100%"
                  h="100%"
                  objectFit="cover"
                  borderRadius={{
                    base: "90px 10px 90px 10px",
                    lg: "90px 10px 90px 10px",
                  }} // Bo góc trên bên trái và dưới bên phải
                  opacity={{ base: "0.6", lg: "1" }}
                  style={{ willChange: "opacity" }}
                />
              </motion.div>
            </AnimatePresence>
          </Box>
        </Flex>
      </Box>
    </Container>
  );
};

export default Banner;
