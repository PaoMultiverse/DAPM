import { Box, ChakraProvider, useToast } from "@chakra-ui/react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import socket from "./services/socket";
import theme from "./theme";
import AuthForm from "./pages/AuthForm";
import LandlordHome from "./landlord/Home";
import HomeDashboard from "./landlord/HomeDashboard";
import HostelManagement from "./landlord/HostelManagement";
import RoomList from "./landlord/RoomList";
import ProfilePage from "./landlord/Profile";
import RentalRequest from "./landlord/RentalRequests";
import TenantRoomList from "./tenant/TenantRoomList";
import TenantContract from "./tenant/TenantContract";
import TenantPayments from "./tenant/TenantPayments";
import TenantDashboard from "./tenant/TenantDashboard";
import TenantHome from "./tenant/TenantHome";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import Receipt from "./landlord/Receipt";
import TenantList from "./landlord/TenantList";
import RevenueStats from "./landlord/RevenueStats";
import AdminDashboard from "./admin/AdminDashboard";
import SearchResults from "./pages/SearchResults";
import MessageManagement from "./landlord/MessageManagement";
import TenantBookingManagement from "./tenant/TenantBookingManagement";
import RoomDetail from "./tenant/RoomDetail";
import { jwtDecode } from "jwt-decode";
import BillList from "./tenant/BillList";
import BillDetail from "./tenant/BillDetail";
import TenantChatList from "./tenant/TenantChatList";

function App() {
  const toast = useToast();
  const [currentUser, setCurrentUser] = useState(null);

  const paypalOptions = {
    "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture",
  };

  console.log("PayPal Options:", paypalOptions);

  useEffect(() => {
    // Xin quyền notification
    if ("Notification" in window) {
      Notification.requestPermission();
    }

    // Lấy thông tin user từ token
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser(decoded);

        // Kết nối socket
        socket.auth = { token };
        socket.connect();
      } catch (error) {
        console.error("Token decode error:", error);
      }
    }

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, []);

  // Xử lý khi user thay đổi tab - chỉ mark read khi có currentUser
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && socket.connected && currentUser) {
        // Không emit mark_messages_read ở đây nữa
        console.log("Tab became visible");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [currentUser]);

  // Socket event listeners
  useEffect(() => {
    if (!socket.connected || !currentUser) return;

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến server chat",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    });

    socket.on("receive_message", (message) => {
      if (document.hidden && Notification.permission === "granted") {
        new Notification("Tin nhắn mới", {
          body: `${message.senderName}: ${message.content}`,
          icon: "/path/to/your/icon.png",
        });
      }
    });

    return () => {
      socket.off("connect_error");
      socket.off("receive_message");
    };
  }, [currentUser, toast]);

  return (
    <ChakraProvider theme={theme}>
      <PayPalScriptProvider options={paypalOptions}>
        <Box minH={"100vh"}>
          <Routes>
            {/* Auth routes */}
            <Route path="/register" element={<AuthForm isRegister={true} />} />
            <Route path="/login" element={<AuthForm isRegister={false} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="*" element={<Navigate to="/login" replace />} />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute rolesRequired={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            ></Route>
            {/* Landlord routes */}
            <Route
              path="/landlord"
              element={
                <ProtectedRoute rolesRequired={["landlord", "manager"]}>
                  <LandlordHome />
                </ProtectedRoute>
              }
            >
              <Route index element={<HomeDashboard />} />
              <Route
                path="hostel-management"
                element={
                  <ProtectedRoute rolesRequired={["landlord"]}>
                    <HostelManagement />
                  </ProtectedRoute>
                }
              />
              <Route path="rental-request" element={<RentalRequest />} />
              <Route path="revenue-stats" element={<RevenueStats />} />
              <Route path="payment-list" element={<Receipt />} />
              <Route path="tenant-list" element={<TenantList />} />
              <Route path="room-list/:facilityId" element={<RoomList />} />
              <Route path="profile-page" element={<ProfilePage />} />
              <Route path="messages" element={<MessageManagement />} />
            </Route>

            {/* Tenant routes */}
            <Route
              path="/tenant"
              element={
                <ProtectedRoute rolesRequired={["tenant"]}>
                  <TenantHome />
                </ProtectedRoute>
              }
            >
              <Route index element={<TenantDashboard />} />
              <Route path="room-list" element={<TenantRoomList />} />
              <Route path="contract" element={<TenantContract />} />
              <Route path="payments" element={<TenantPayments />} />
              <Route path="profile-page" element={<ProfilePage />} />
              <Route path="bookings" element={<TenantBookingManagement />} />
              <Route path="room-detail/:id" element={<RoomDetail />} />
              <Route path="bills" element={<BillList />} />
              <Route path="bills/:billId" element={<BillDetail />} />
              <Route path="messages" element={<TenantChatList />} />
            </Route>

            <Route path="/search-results" element={<SearchResults />} />
          </Routes>
        </Box>
      </PayPalScriptProvider>
    </ChakraProvider>
  );
}

export default App;
