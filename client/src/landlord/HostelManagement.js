import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  VStack,
  Flex,
  Text,
  Image,
  Heading,
  Select,
  Avatar,
  HStack,
  Badge,
  Stack,
  IconButton,
  useToast,
  Tooltip,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  DeleteIcon,
  EditIcon,
  PlusSquareIcon,
  CloseIcon,
} from "@chakra-ui/icons";
import { jwtDecode } from "jwt-decode";
import vietnamData from "../data/dvhcvn.json";

import Pagination from "../components/Pagination";

const HostelManagement = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [facilities, setFacilities] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    image: null,
  });
  const toast = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      const decodedUser = jwtDecode(storedToken);
      setCurrentUser(decodedUser);
    }
  }, []);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API}/landlord/hostel`,
          {
            params: {
              landlordId: currentUser.id,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(response.data);
        setFacilities(response.data.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };

    if (currentUser && token) {
      fetchFacilities();
    }
  }, [currentUser, token]);

  useEffect(() => {
    setProvinces(vietnamData.data);
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        if (!token) return;

        const response = await axios.get(
          `${process.env.REACT_APP_API}/user/current`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          const userData = response.data.data;
          setCurrentUser({
            id: userData._id,
            name: userData.name,
          });
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin người dùng",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchCurrentUser();
  }, [token, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleProvinceChange = (e) => {
    const provinceName = e.target.value;
    const province = provinces.find((p) => p.name === provinceName);
    setDistricts(province ? province.level2s : []);
    setWards([]);
    setFormData({
      ...formData,
      city: provinceName,
      district: "",
      ward: "",
    });
  };

  const handleDistrictChange = (e) => {
    const districtName = e.target.value;
    const district = districts.find((d) => d.name === districtName);
    setWards(district ? district.level3s : []);
    setFormData({
      ...formData,
      district: districtName,
      ward: "",
    });
  };

  const handleWardChange = (e) => {
    const wardName = e.target.value;
    setFormData({
      ...formData,
      ward: wardName,
    });
  };

  const handleSubmit = async () => {
    const data = new FormData();
    data.append("name", formData.name);
    data.append("address", formData.address);
    data.append("city", formData.city);
    data.append("district", formData.district);
    data.append("ward", formData.ward);
    data.append("image", formData.image);
    data.append("landlordId", currentUser.id);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API}/landlord/hostel/create`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setFacilities((prev) => [...prev, response.data.data]);
      setFormData({
        name: "",
        address: "",
        city: "",
        district: "",
        ward: "",
        image: null,
      });
      onClose();
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu:", error);
    }
  };

  const handleDeleteFacility = async (id) => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API}/landlord/hostel/${id}/delete`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        toast({
          title: "Xóa cơ sở thành công!",
          description: response.data.message,
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        setFacilities((prev) => prev.filter((facility) => facility.id !== id));
      } else {
        toast({
          title: "Có lỗi xảy ra.",
          description: response.data.message || "Vui lòng thử lại.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Không thể xóa cơ sở.",
        description: error.response?.data?.message || "Vui lòng thử lại.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const FacilityItem = ({ facility }) => {
    const navigate = useNavigate();

    const handleClick = () => {
      navigate(`/landlord/room-list/${facility.id}`);
    };

    return (
      <Stack
        marginBlockEnd={4}
        justifyContent={"center"}
        spacing={4}
        boxShadow="xl"
      >
        <Box
          key={facility.id}
          p={{ base: 2, md: 4 }}
          borderWidth="1px"
          borderRadius="md"
          shadow="sm"
          bg="brand.2"
        >
          <Flex flexDirection={{ base: "column", md: "row" }}>
            {/* Image Column */}
            <Box
              cursor="pointer"
              onClick={handleClick}
              width={{ base: "100%", md: "30%" }}
              pr={{ base: 0, md: 4 }}
            >
              <Image
                borderRadius={8}
                src={facility.imageUrl}
                alt={facility.name}
                width="100%"
                height="200px"
                objectFit="cover"
              />
            </Box>

            {/* Content Column */}
            <Box
              cursor="pointer"
              onClick={handleClick}
              width={{ base: "100%", md: "50%" }}
              display="flex"
              flexDirection="column"
              gap={{ base: 1, md: 2 }}
            >
              <Heading
                textAlign={{ base: "center", md: "left" }}
                as="h4"
                fontSize={{ base: "xl", md: "2xl" }}
                color="blue.500"
              >
                {facility.name}
              </Heading>
              <Box display="flex" alignItems="center">
                <Text fontSize="md" color="gray.600" mr={2}>
                  Địa chỉ:
                </Text>
                <Text fontSize="md" fontWeight={"bold"}>
                  {facility.address}
                </Text>
              </Box>
              <Box display="flex" alignItems="center">
                <Text fontSize="md" color="gray.600" mr={2}>
                  Thành phố:
                </Text>
                <Text fontSize="md" fontWeight={"bold"}>
                  {facility.city}
                </Text>
              </Box>
              <Box display="flex" alignItems="center">
                <Text fontSize="md" color="gray.600" mr={2}>
                  Quận:
                </Text>
                <Text fontSize="md" fontWeight={"bold"}>
                  {facility.district}
                </Text>
              </Box>
            </Box>

            {/* Buttons Column */}
            <Box width={{ base: "100%", md: "20%" }}>
              <Flex justifyContent="flex-end">
                <Tooltip label="Chỉnh sửa cơ sở">
                  <IconButton icon={<EditIcon />} colorScheme="blue" mr={2} />
                </Tooltip>
                {(facility.roomCount === 0 || !facility.roomCount) && (
                  <Tooltip label="Xóa cơ sở">
                    <IconButton
                      onClick={() => handleDeleteFacility(facility.id)}
                      colorScheme="red"
                      icon={<DeleteIcon />}
                    />
                  </Tooltip>
                )}
              </Flex>
            </Box>
          </Flex>
        </Box>
      </Stack>
    );
  };

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return facilities.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(facilities.length / itemsPerPage);
  return (
    <Box>
      <Heading
        textColor={"blue.500"}
        as="h3"
        size="lg"
        mb={{ base: 4, md: 12 }}
      >
        Quản Lý Cơ Sở
      </Heading>

      <Flex justifyContent="flex-end" mb={6}>
        <Button
          onClick={onOpen}
          colorScheme="green"
          leftIcon={<PlusSquareIcon />}
          mr={{ base: 2, md: 0 }}
        >
          Thêm cơ sở mới
        </Button>
        <Modal isCentered isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader
              fontSize={"2xl"}
              fontWeight={"bold"}
              textColor={"brand.700"}
              textAlign={"center"}
              textTransform={"capitalize"}
            >
              Tạo cơ sở mới
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Tên chi nhánh</FormLabel>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Nhập tên cơ sở"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Thành phố/Tỉnh</FormLabel>
                  <Select
                    name="city"
                    value={formData.city}
                    onChange={handleProvinceChange}
                    placeholder="Chọn thành phố/tỉnh"
                  >
                    {provinces.map((province) => (
                      <option key={province.level1_id} value={province.name}>
                        {province.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Quận/Huyện</FormLabel>
                  <Select
                    name="district"
                    value={formData.district}
                    onChange={handleDistrictChange}
                    placeholder="Chọn quận/huyện"
                    isDisabled={!formData.city}
                  >
                    {districts.map((district) => (
                      <option key={district.level2_id} value={district.name}>
                        {district.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Xã/Phường</FormLabel>
                  <Select
                    name="ward"
                    value={formData.ward}
                    onChange={handleWardChange}
                    placeholder="Chọn xã/phường"
                    isDisabled={!formData.district}
                  >
                    {wards.map((ward) => (
                      <option key={ward.level3_id} value={ward.name}>
                        {ward.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Địa chỉ chi tiết</FormLabel>
                  <Input
                    type="text"
                    name="address"
                    placeholder="Nhập số nhà, tên đường..."
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Hình ảnh</FormLabel>
                  <Input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="green" mr={3} onClick={handleSubmit}>
                Tạo cơ sở
              </Button>
              <Button colorScheme="red" onClick={onClose}>
                Hủy
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Flex>

      {getCurrentPageData().map((facility) => (
        <FacilityItem key={facility.id} facility={facility} />
      ))}

      <Box mt={4} display="flex" justifyContent="center">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </Box>
    </Box>
  );
};

export default HostelManagement;
