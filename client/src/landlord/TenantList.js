import { useState, useEffect } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Select,
  VStack,
  Heading,
  Spinner,
  Center,
  useToast,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import Pagination from "../components/Pagination";

function TenantList() {
  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nameFilter, setNameFilter] = useState("");
  const [facilityFilter, setFacilityFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const toast = useToast();

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log('Token being used:', token);

        const response = await axios.get(
          `${process.env.REACT_APP_API}/landlord/tenant-list`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log('API Response:', response.data);
        
        if (response.data.success) {
          setTenants(response.data.data);
        }
      } catch (error) {
        console.error("Error details:", error.response?.data || error);
        toast({
          title: "Lỗi",
          description: error.response?.data?.message || "Không thể tải danh sách khách thuê",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenants();
  }, [toast]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const filteredTenants = tenants.filter((tenant) => {
    const nameMatch = tenant.name
      .toLowerCase()
      .includes(nameFilter.toLowerCase());
    const facilityMatch = facilityFilter
      ? tenant.facility === facilityFilter
      : true;
    return nameMatch && facilityMatch;
  });

  const uniqueFacilities = [...new Set(tenants.map((tenant) => tenant.facility))];
  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTenants.slice(startIndex, endIndex);
  };

  if (isLoading) {
    return (
      <Center h="200px">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box>
      <Heading textColor={"blue.500"} as="h3" size="lg" mb={12}>
        Danh Sách Khách Thuê
      </Heading>
      
      <VStack align="start" spacing={4} mb={4}>
        <Select
          placeholder="Chọn cơ sở"
          value={facilityFilter}
          onChange={(e) => setFacilityFilter(e.target.value)}
        >
          {uniqueFacilities.map((facility) => (
            <option key={facility} value={facility}>
              {facility}
            </option>
          ))}
        </Select>
        <Input
          placeholder="Tìm theo tên khách thuê"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />
      </VStack>

      {getCurrentPageData().length === 0 ? (
        <Center h="200px">
          <Text>Không có khách thuê nào</Text>
        </Center>
      ) : (
        <>
          <Table variant="striped" colorScheme="blue">
            <Thead>
              <Tr>
                <Th>Tên Khách Thuê</Th>
                <Th>Tên Cơ Sở</Th>
                <Th>Tên Phòng</Th>
                <Th>Ngày Bắt Đầu Hợp Đồng</Th>
                <Th>Ngày Kết Thúc Hợp Đồng</Th>
              </Tr>
            </Thead>
            <Tbody>
              {getCurrentPageData().map((tenant) => (
                <Tr key={tenant._id}>
                  <Td>{tenant.name}</Td>
                  <Td>{tenant.facility}</Td>
                  <Td>{tenant.room}</Td>
                  <Td>{new Date(tenant.startDate).toLocaleDateString('vi-VN')}</Td>
                  <Td>{new Date(tenant.endDate).toLocaleDateString('vi-VN')}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          <Box mt={4} display="flex" justifyContent="center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </Box>
        </>
      )}
    </Box>
  );
}

export default TenantList;
