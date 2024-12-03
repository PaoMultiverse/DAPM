import { Navigate } from "react-router-dom";

import { jwtDecode } from "jwt-decode";

const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now(); // True nếu token hết hạn
  } catch (error) {
    return true; // Lỗi khi giải mã cũng coi như token hết hạn
  }
};

const ProtectedRoute = ({ children, rolesRequired = [] }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Nếu không có token, chuyển hướng tới trang đăng nhập
  if (!token || isTokenExpired(token)) {
    return <Navigate to="/login" />;
  }

  // Nếu vai trò người dùng không thuộc danh sách vai trò được phép
  if (rolesRequired.length > 0 && !rolesRequired.includes(role)) {
    return <Navigate to="/unauthorized" />; //! Cần thêm trang xử lý sai role
  }

  // Nếu người dùng có quyền truy cập, render nội dung
  return children;
};

export default ProtectedRoute;
