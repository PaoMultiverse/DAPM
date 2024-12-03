import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Box,
  Text,
  Stack,
  Flex,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Textarea,
  useToast,
  Heading,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { TiTick } from "react-icons/ti";
const AdminHostel = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [comment, setComment] = useState("");
  const toast = useToast();
  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/hostel", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data);
        setPosts(response.data.data);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/posts/${postId}`);
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
      alert("Xóa bài đăng thành công");
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const acceptPost = (post) => {
    // Code logic chỉnh sửa bài đăng
    console.log("Accepted post:", post);
  };
  const openRejectModal = (postId) => {
    setCurrentPostId(postId);
    setIsRejectModalOpen(true);
  };
  const handleRejectSubmit = async () => {
    if (comment.trim() === "") {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập lý do từ chối.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/admin/posts/${currentPostId}/reject`,
        { comment }
      );
      setPosts((prevPosts) =>
        prevPosts.filter((post) => post._id !== currentPostId)
      );
      toast({
        title: "Thành công",
        description: "Đã từ chối bài đăng và lưu bình luận.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Failed to reject post:", error);
    } finally {
      closeRejectModal();
    }
  };

  // Đóng modal từ chối
  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
    setCurrentPostId(null);
    setComment("");
  };
  return (
    <Box>
      <Heading
        textAlign={"center"}
        textColor={"blue.500"}
        as="h3"
        size={{ base: "md", md: "lg" }}
        my={{ base: 4, md: 12 }}
      >
        Quản Lý Bài Đăng Cơ Sở
      </Heading>
      <Stack
        mx="auto"
        justifyContent={"center"}
        w={{ base: "100%", md: "6xl" }}
        spacing={4}
      >
        {posts.map((post) => (
          <Box
            key={post._id}
            p={{ base: 2, md: 4 }}
            borderWidth="1px"
            borderRadius="md"
            shadow="sm"
            bg="brand.2"
          >
            <Flex flexDirection={{ base: "column", md: "row" }}>
              {/* Image Column */}
              <Box width={{ base: "100%", md: "30%" }} pr={{ base: 0, md: 4 }}>
                <Image
                  borderRadius={8}
                  src={post.imageUrl}
                  alt={post.name}
                  width="100%"
                  height="200px"
                  objectFit="cover"
                />
              </Box>

              {/* Content Column */}
              <Box
                width={{ base: "100%", md: "50%" }}
                display="flex"
                flexDirection="column"
                gap={{ base: 1, md: 2 }}
              >
                <Heading
                  textAlign={{ base: "center", md: "left" }}
                  as="h4"
                  fontSize={{ base: "xl", md: "2xl" }}
                >
                  {post.name}
                </Heading>
                <Box display="flex" alignItems="center">
                  <Text fontSize="md" color="gray.600" mr={2}>
                    Chủ nhà:
                  </Text>
                  <Text fontSize="md" fontWeight={"bold"}>
                    {post.landlordName}
                  </Text>
                </Box>

                <Box display="flex" alignItems="center">
                  <Text fontSize="md" color="gray.600" mr={2}>
                    Thành phố:
                  </Text>
                  <Text fontSize="md" fontWeight={"bold"}>
                    {post.city}
                  </Text>
                </Box>
                <Box display="flex" alignItems="center">
                  <Text fontSize="md" color="gray.600" mr={2}>
                    Quận:
                  </Text>
                  <Text fontSize="md" fontWeight={"bold"}>
                    {post.district}
                  </Text>
                </Box>
                <Box display="flex" alignItems="center">
                  <Text fontSize="md" color="gray.600" mr={2}>
                    Địa chỉ:
                  </Text>
                  <Text fontSize="md" fontWeight={"bold"}>
                    {post.address}
                  </Text>
                </Box>
              </Box>
              <Box width={{ base: "100%", md: "20%" }}>
                {/* Action Buttons */}
                <Flex mt={4} justify="flex-end">
                  <Button
                    size="sm"
                    leftIcon={<TiTick />}
                    colorScheme="green"
                    onClick={() => acceptPost(post)}
                    mr={2}
                  >
                    Chấp nhận
                  </Button>
                  <Button
                    size="sm"
                    leftIcon={<CloseIcon />}
                    colorScheme="red"
                    onClick={() => openRejectModal(post._id)}
                  >
                    Từ chối
                  </Button>
                </Flex>
              </Box>
            </Flex>
          </Box>
        ))}
      </Stack>
      <Modal isOpen={isRejectModalOpen} onClose={closeRejectModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign={"center"}>Lý do từ chối bài đăng</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Textarea
              placeholder="Nhập bình luận của bạn tại đây..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={handleRejectSubmit}>
              Xác nhận
            </Button>
            <Button onClick={closeRejectModal}>Hủy</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminHostel;
