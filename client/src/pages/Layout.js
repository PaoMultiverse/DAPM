import React from "react";
import {
  Grid,
  GridItem,
  IconButton,
  Box,
  useDisclosure,
  Flex,
  Input,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import Header from "../components/Header";

const Navigation = () => (
  <Box>
    <Box>Nav Item 1</Box>
    <Box>Nav Item 2</Box>
    <Box>Nav Item 3</Box>
  </Box>
);

const Template = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    //layout có sidebar
    <Grid
      templateAreas={{
        base: `"header"
               "main"
               "footer"`, // Mobile view
        md: `"header header"
             "nav main"
             "footer footer"`, // Tablet and larger screens
      }}
      gridTemplateRows={{
        base: "100px 1fr 100px", // Mobile view
        md: "100px 1fr 200px", // Tablet and larger screens
      }}
      gridTemplateColumns={{
        base: "1fr", // Mobile view
        md: "150px 1fr", // Tablet and larger screens
      }}
      minHeight="100vh" // Ensure the grid takes at least full height of the viewport
      width="100%" // Ensure the grid takes full width
      gap={2}
      color="blackAlpha.700"
      fontWeight="bold"
      textAlign={"center"}
    >
      <Header />
      {/* Desktop Navigation */}
      <GridItem
        mt={20}
        pl="2"
        bg="pink.300"
        area={"nav"}
        display={{ base: "none", md: "block" }} // Only show on desktop
      >
        <Navigation />
      </GridItem>
      {/* Main Content */}
      <GridItem mt={20} h={"1000px"} pl="2" bg="green.300" area={"main"}>
        Main
      </GridItem>
      {/* Footer */}  
      <GridItem pl="2" bg="blue.300" width="100%" area={"footer"}>
        Footer
      </GridItem>
      {/* Drawer for mobile navigation */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Navigation</DrawerHeader>
          <DrawerBody>
            <Navigation /> {/* Use the same Navigation component */}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Grid>
    //layout không có sidebar
    // <Grid
    //   templateAreas={{
    //     base: `"header"
    //        "main"
    //        "footer"`,
    //     md: `"header header"
    //      "main main"
    //      "footer footer"`,
    //   }}
    //   gridTemplateRows={{
    //     base: "auto 1fr 100px",
    //     md: "auto 1fr 200px",
    //   }}
    //   gridTemplateColumns={{
    //     base: "1fr",
    //     md: "150px 1fr",
    //   }}
    //   minHeight="100vh"
    //   width="100%"
    //   gap={2}
    //   color="blackAlpha.700"
    //   fontWeight="bold"
    //   textAlign={"center"}
    //   pt="100px" // Padding to account for the fixed header height
    // >
    //   {/* Header Section */}
    //   <Header />

    //   {/* Main Content */}
    //   <GridItem h={"1000px"} mt="20" pl="2" bg="green.300" area={"main"}>
    //     {/* Content here */}
    //   </GridItem>

    //   {/* Footer */}
    //   <GridItem pl="2" bg="blue.300" area={"footer"}>
    //     Footer
    //   </GridItem>
    // </Grid>
  );
};

export default Template;
