import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Grid,
  Heading,
  Text,
  Image,
  SimpleGrid,
  Badge,
  Flex,
  Container,
} from "@chakra-ui/react";

const SearchResults = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get("keyword");
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API}/user/search`,
          {
            params: { keyword },
          }
        );
        if (response.data.success) {
          setResults(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    };

    if (keyword) {
      fetchResults();
    }
  }, [keyword]);

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6}>Kết quả tìm kiếm cho "{keyword}"</Heading>

      {/* Hiển thị kết quả nhà trọ */}
      {results?.hostel?.length > 0 && (
        <Box mb={8}>
          <Heading size="md" mb={4}>
            Nhà trọ ({results.hostel.length})
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {results.hostel.map((hostel) => (
              <Box
                key={hostel.id}
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                shadow="md"
              >
                <Image
                  src={hostel.imageUrl}
                  alt={hostel.name}
                  height="200px"
                  width="100%"
                  objectFit="cover"
                />
                <Box p={4}>
                  <Heading size="md" mb={2}>
                    {hostel.name}
                  </Heading>
                  <Text color="gray.600" mb={2}>
                    {hostel.address}, {hostel.district}, {hostel.city}
                  </Text>
                  <Text>Số phòng trống: {hostel.availableRooms.length}</Text>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      )}

      {/* Hiển thị kết quả phòng */}
      {results?.rooms?.length > 0 && (
        <Box>
          <Heading size="md" mb={4}>
            Phòng trống ({results.rooms.length})
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {results.rooms.map((room) => (
              <Box
                key={room.id}
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                shadow="md"
              >
                <Image
                  src={room.images[0]}
                  alt={room.roomName}
                  height="200px"
                  width="100%"
                  objectFit="cover"
                />
                <Box p={4}>
                  <Heading size="md" mb={2}>
                    {room.roomName}
                  </Heading>
                  <Text fontWeight="bold" color="blue.500" mb={2}>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(room.price)}
                  </Text>
                  <Text mb={2}>Diện tích: {room.area}m²</Text>
                  <Text color="gray.600">
                    {room.hostel.address}, {room.hostel.district},{" "}
                    {room.hostel.city}
                  </Text>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      )}

      {!results?.hostel?.length && !results?.rooms?.length && (
        <Text fontSize="lg" textAlign="center" color="gray.500">
          Không tìm thấy kết quả nào cho từ khóa "{keyword}"
        </Text>
      )}
    </Container>
  );
};

export default SearchResults;
