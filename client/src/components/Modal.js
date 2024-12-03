import React, { useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Grid,
  Select,
  Text,
  HStack,
  Image,
  VStack,
  Box,
  Avatar,
  GridItem,
  Heading,
  InputGroup,
  Flex,
} from "@chakra-ui/react";

// Modal thêm phòng mới
export const NewRoomModal = ({
  isOpen,
  onClose,
  newRoom,
  setNewRoom,
  handleCreateRoom,
  handleImageChange,
  handleInputChange,
}) => (
  <Modal isCentered isOpen={isOpen} onClose={onClose} size={"xl"}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader
        fontSize={"2xl"}
        fontWeight={"bold"}
        textColor={"brand.700"}
        textAlign={"center"}
        textTransform={"capitalize"}
      >
        Thêm phòng mới
      </ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <FormControl mb={2} isRequired>
          <FormLabel>Tiêu đề bài đăng</FormLabel>
          <Input
            name="roomTitle"
            value={newRoom.roomTitle}
            onChange={(e) => handleInputChange(e, setNewRoom)}
            placeholder="Nhập tiêu đề bài đăng"
          />
        </FormControl>
        <FormControl mb={2} isRequired>
          <FormLabel>Tên phòng</FormLabel>
          <Input
            name="roomName"
            value={newRoom.roomName}
            onChange={(e) => handleInputChange(e, setNewRoom)}
            placeholder="Nhập tên phòng"
          />
        </FormControl>
        <FormControl mb={2} isRequired>
          <FormLabel>Diện tích (m²)</FormLabel>
          <Input
            type="number"
            name="area"
            value={newRoom.area}
            onChange={(e) => handleInputChange(e, setNewRoom)}
            placeholder="Nhập diện tích phòng"
          />
        </FormControl>
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <FormControl mb={2} isRequired>
            <FormLabel>Số tiền cọc (VND)</FormLabel>
            <Input
              type="text"
              name="deposit"
              value={newRoom.deposit}
              onChange={(e) => handleInputChange(e, setNewRoom)}
              placeholder="Nhập số tiền cọc"
            />
          </FormControl>
          <FormControl mb={2} isRequired>
            <FormLabel>Giá phòng (VND)</FormLabel>
            <Input
              type="text"
              name="price"
              value={newRoom.price}
              onChange={(e) => handleInputChange(e, setNewRoom)}
              placeholder="Nhập giá phòng"
            />
          </FormControl>
        </Grid>
        <FormControl mb={2} isRequired gridColumn="span 2">
          <FormLabel>Mô tả chi tiết</FormLabel>
          <Textarea
            name="description"
            value={newRoom.description}
            onChange={(e) => handleInputChange(e, setNewRoom)}
            placeholder="Nhập mô tả phòng"
          />
        </FormControl>
        <FormControl mb={2} isRequired gridColumn="span 2">
          <FormLabel>Thêm hình ảnh</FormLabel>
          <Input
            type="file"
            name="images"
            onChange={handleImageChange}
            multiple
            accept="image/*"
          />
          <Text mt={2}>Bạn có thể tải lên tối đa 5 hình ảnh</Text>
        </FormControl>
      </ModalBody>
      <ModalFooter>
        <Button colorScheme="green" mr={3} onClick={handleCreateRoom}>
          Tạo phòng
        </Button>
        <Button onClick={onClose}>Hủy</Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

// Modal cập nhật thông tin phòng
export const UpdateModal = ({
  isOpen,
  onClose,
  update,
  setUpdate,
  handleUpdate,
  handleInputChange,
}) => (
  <Modal isCentered isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader
        fontSize={"2xl"}
        fontWeight={"bold"}
        textColor={"brand.700"}
        textAlign={"center"}
        textTransform={"capitalize"}
      >
        Cập nhật số điện và Số Nước
      </ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <FormControl mb={4}>
          <FormLabel>Số điện</FormLabel>
          <Input
            type="number"
            placeholder="Nhập số điện"
            name="elecIndex"
            value={update.elecIndex}
            onChange={(e) => handleInputChange(e, setUpdate)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Số nước</FormLabel>
          <Input
            type="number"
            placeholder="Nhập số nước"
            name="aquaIndex"
            value={update.aquaIndex}
            onChange={(e) => handleInputChange(e, setUpdate)}
          />
        </FormControl>
      </ModalBody>
      <ModalFooter>
        <Button colorScheme="blue" onClick={handleUpdate}>
          Cập nhật
        </Button>
        <Button onClick={onClose} variant="ghost" ml={3}>
          Hủy
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);
// Modal tạo hóa đơn
export const BillModal = ({
  isOpen,
  onClose,
  sampleBill,
  setSampleBill,
  handleInputChange,
  handleCreateBill,
  parseNumber,
}) => {
  // Tính toán tổng tiền mỗi khi các giá trị thay đổi
  useEffect(() => {
    const calculateTotal = () => {
      const elecBill = parseFloat(sampleBill.elecBill) || 0;
      const waterBill = parseFloat(sampleBill.waterBill) || 0;
      const serviceFee = parseFloat(sampleBill.serviceFee) || 0;
      const total = elecBill + waterBill + serviceFee;

      setSampleBill((prev) => ({ ...prev, total })); // Cập nhật tổng tiền
    };

    calculateTotal();
  }, [
    sampleBill.elecBill,
    sampleBill.waterBill,
    sampleBill.serviceFee,
    setSampleBill,
  ]);

  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          fontSize={"2xl"}
          fontWeight={"bold"}
          textColor={"brand.700"}
          textAlign={"center"}
          textTransform={"capitalize"}
        >
          Tạo hóa đơn mới
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            <FormControl isRequired>
              <FormLabel>Tiền điện</FormLabel>
              <Text>{sampleBill.elecBill || 0} VNĐ</Text>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Tiền nước</FormLabel>
              <Text>{sampleBill.waterBill || 0} VNĐ</Text>
            </FormControl>
            <FormControl>
              <FormLabel>Phí khác</FormLabel>
              <Input
                type="number"
                name="serviceFee"
                value={sampleBill.serviceFee || ""}
                onChange={(e) => {
                  const numericValue = parseNumber(e.target.value); // Chuyển đổi sang số
                  if (numericValue >= 0) {
                    handleInputChange(
                      { target: { name: "serviceFee", value: numericValue } },
                      setSampleBill
                    );
                  }
                }}
                placeholder="Nhập phí khác (nếu có)"
              />
            </FormControl>
            {sampleBill.serviceFee && (
              <FormControl>
                <FormLabel>Nội dung phí khác</FormLabel>
                <Input
                  type="text"
                  name="serviceFeeDescription"
                  value={sampleBill.serviceFeeDescription || ""}
                  onChange={(e) => handleInputChange(e, setSampleBill)}
                  placeholder="Nhập nội dung của phí khác"
                />
              </FormControl>
            )}
            <FormControl isRequired>
              <FormLabel>Tổng tiền</FormLabel>
              <Text fontWeight="bold">{sampleBill.total || 0} VNĐ</Text>
            </FormControl>
          </Grid>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="green"
            onClick={() => handleCreateBill(sampleBill)}
          >
            Tạo hóa đơn
          </Button>
          <Button onClick={onClose} ml={3}>
            Hủy
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
// Modal tạo hợp đồng
export const ContractModal = ({
  isOpen,
  onClose,
  contractDetails,
  setContractDetails,
  handleCreateContract,
  handleInputChange,
}) => (
  <Modal isCentered isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader
        fontSize={"2xl"}
        fontWeight={"bold"}
        textColor={"brand.700"}
        textAlign={"center"}
        textTransform={"capitalize"}
      >
        Hợp Đồng Thuê Phòng
      </ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Ngày bắt đầu</FormLabel>
            <Input
              type="date"
              name="startDate"
              value={contractDetails.startDate}
              onChange={(e) => handleInputChange(e, setContractDetails)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Ngày kết thúc</FormLabel>
            <Input
              type="date"
              name="endDate"
              value={contractDetails.endDate}
              onChange={(e) => handleInputChange(e, setContractDetails)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Tiền đặt cọc (VNĐ)</FormLabel>
            <Input
              type="text"
              name="depositFee"
              placeholder="Nhập số tiền cọc"
              value={contractDetails.depositFee}
              onChange={(e) => handleInputChange(e, setContractDetails)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Tiền thuê hàng tháng (VNĐ)</FormLabel>
            <Input
              type="text"
              name="rentFee"
              placeholder="Nhập số tiền thuê"
              value={contractDetails.rentFee}
              onChange={(e) => handleInputChange(e, setContractDetails)}
            />
          </FormControl>
          <HStack spacing={4} align="flex-start">
            <FormControl isRequired>
              <FormLabel>Giá điện (đồng/kWh)</FormLabel>
              <Input
                type="text"
                name="electricityFee"
                placeholder="Nhập số tiền điện"
                value={contractDetails.electricityFee}
                onChange={(e) => handleInputChange(e, setContractDetails)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Giá nước (đồng/m³)</FormLabel>
              <Input
                type="text"
                name="waterFee"
                placeholder="Nhập số tiền nước"
                value={contractDetails.waterFee}
                onChange={(e) => handleInputChange(e, setContractDetails)}
              />
            </FormControl>
          </HStack>
          <FormControl isRequired>
            <FormLabel>Email người thuê</FormLabel>
            <Input
              name="tenantEmail"
              value={contractDetails.tenantEmail}
              onChange={(e) => handleInputChange(e, setContractDetails)}
              placeholder="Nhập email người thuê"
            />
          </FormControl>
        </VStack>
      </ModalBody>

      <ModalFooter>
        <Button colorScheme="green" mr={3} onClick={handleCreateContract}>
          Tạo hợp đồng
        </Button>
        <Button onClick={onClose}>Hủy</Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);
// Modal xem thông tin phòng
export const InfoModal = ({
  isOpen,
  onClose,
  user,
  selectedRoom,
  selectedImage,
  setSelectedImage,
  formatNumber,
}) => (
  <Modal
    size={{ base: "full", md: "2xl" }}
    isCentered
    isOpen={isOpen}
    onClose={onClose}
  >
    <ModalOverlay />
    <ModalContent>
      <ModalHeader
        fontSize={"2xl"}
        fontWeight={"bold"}
        textColor={"brand.700"}
        textAlign={"center"}
        textTransform={"capitalize"}
      >
        thông tin {selectedRoom?.roomName || "Đang tải..."}
      </ModalHeader>
      <ModalCloseButton />

      <ModalBody>
        {/* Main Image and Details */}
        <HStack align="start" spacing={4}>
          <Image
            src={selectedImage || "Đang tải..."}
            alt={selectedRoom?.roomName || "Đang tải..."}
            borderRadius="md"
            boxSize="300px"
            objectFit="cover"
          />

          {/* Room Details */}

          <VStack align={"start"} spacing={2} flex="1">
            <Heading size="md">
              Năm {selectedRoom?.latestUnitRoom?.year}
            </Heading>
            <Box>
              <Heading size="sm">
                Số điện tháng {selectedRoom?.latestUnitRoom?.month} :
              </Heading>
              <Text>
                {" "}
                {selectedRoom?.latestUnitRoom?.elecIndex || "Đang tải..."} kWh
              </Text>
            </Box>
            <Heading size="sm">
              Số nước tháng {selectedRoom?.latestUnitRoom?.month} :
            </Heading>
            <Text>
              {selectedRoom?.latestUnitRoom?.aquaIndex || "Đang tải..."} m³
            </Text>
            <Heading size="sm">Giá phòng:</Heading>
            <Text>
              {formatNumber(selectedRoom?.price) || "Đang tải..."} VND
            </Text>
            <Heading size="sm">Diện tích:</Heading>
            <Text>{selectedRoom?.area || "Đang tải..."} m²</Text>
            <Heading size="sm">Mô tả:</Heading>
            <Text>{selectedRoom?.description || "Đang tải..."}</Text>
          </VStack>
        </HStack>

        {/* Thumbnail Images */}
        <HStack mt={3} spacing={3}>
          {selectedRoom?.images.map((image, index) => (
            <Image
              key={index}
              src={image}
              alt={`Thumbnail ${index + 1}`}
              boxSize="50px"
              objectFit="cover"
              borderRadius="md"
              cursor="pointer"
              onClick={() => setSelectedImage(image)} // Cập nhật hình ảnh khi nhấp vào
            />
          )) || "Đang tải"}
        </HStack>
        <Heading my={3} size="md">
          Thông tin khách thuê:
        </Heading>
        {/* Tenant Information */}
        <Box bgColor={"brand.100"} borderWidth="1px" borderRadius="md" p={4}>
          <HStack spacing={3}>
            {/* <Avatar src={selectedRoom.tenantAvatar} /> */}
            <VStack align="start" spacing={0}>
              <Text>Tên khách thuê: {user?.name || "Chưa có người thuê"}</Text>
              <Text>
                Số điện thoại: {user?.numPhone || "Chưa có người thuê"}
              </Text>
            </VStack>
          </HStack>
        </Box>
      </ModalBody>

      <ModalFooter>
        <Button onClick={onClose} colorScheme="gray" mr={3}>
          Đóng
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);
// Modal chỉnh sửa phòng
export const EditModal = ({
  isOpen,
  onClose,
  selectedRoom,
  handleEditRoom,
  handleInputChange,
}) => (
  <Modal isCentered isOpen={isOpen} onClose={onClose} size={"2xl"}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>
        <ModalHeader
          fontSize={"2xl"}
          fontWeight={"bold"}
          textColor={"brand.700"}
          textAlign={"center"}
          textTransform={"capitalize"}
        >
          chỉnh sửa thông tin {selectedRoom?.roomName || "Đang tải..."}
        </ModalHeader>
      </ModalHeader>

      <ModalCloseButton />
      <ModalBody>
        {/* Main Image and Details */}
        <HStack align="start" spacing={4}>
          <Image
            src={selectedRoom?.images || ""}
            alt={selectedRoom?.roomName || "Đang tải..."}
            borderRadius="md"
            boxSize="250px"
            objectFit="cover"
          />
          <VStack align={"start"} spacing={2} flex="1">
            <Heading size="md">Tên phòng:</Heading>
            <Input
              value={selectedRoom?.roomName || ""}
              onChange={(e) =>
                handleInputChange("roomName", e, handleInputChange)
              }
              placeholder="Tên phòng"
            />
            <Heading size="md">Giá phòng:</Heading>
            <Input
              type="number"
              value={selectedRoom?.price || ""}
              onChange={(e) => handleInputChange("price", e, handleInputChange)}
              placeholder="Giá phòng (VND)"
            />
            <Heading size="md">Diện tích:</Heading>
            <Input
              type="number"
              value={selectedRoom?.area || ""}
              onChange={(e) => handleInputChange("area", e, handleInputChange)}
              placeholder="Diện tích (m²)"
            />
            <Heading size="md">Mô tả:</Heading>
            <Textarea
              value={selectedRoom?.description || ""}
              onChange={(e) =>
                handleInputChange("description", e, handleInputChange)
              }
              placeholder="Mô tả phòng"
            />
          </VStack>
        </HStack>

        {/* Thumbnail Images */}
        <HStack mt={4} spacing={2}>
          {selectedRoom?.images?.map((image, index) => (
            <Image
              key={index}
              src={image}
              alt={`Thumbnail ${index + 1}`}
              boxSize="50px"
              objectFit="cover"
              borderRadius="md"
              cursor="pointer"
            />
          ))}
        </HStack>
      </ModalBody>
      <ModalFooter>
        <Button colorScheme="blue" onClick={handleEditRoom} mr={3}>
          Lưu thay đổi
        </Button>{" "}
        <Button onClick={onClose} colorScheme="gray">
          Đóng
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);
