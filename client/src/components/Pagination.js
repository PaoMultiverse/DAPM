import { Button, Flex, Text } from "@chakra-ui/react";

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  showPageNumbers = true 
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <Flex justify="center" align="center" mt={4} gap={2}>
      <Button
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        isDisabled={currentPage === 1}
      >
        Trước
      </Button>

      {showPageNumbers && pages.map((page) => (
        <Button
          key={page}
          size="sm"
          variant={currentPage === page ? "solid" : "outline"}
          colorScheme={currentPage === page ? "blue" : "gray"}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}

      <Button
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        isDisabled={currentPage === totalPages}
      >
        Sau
      </Button>

      <Text fontSize="sm" ml={2}>
        Trang {currentPage} / {totalPages}
      </Text>
    </Flex>
  );
};

export default Pagination;