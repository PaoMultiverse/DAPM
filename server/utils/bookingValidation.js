const validateBookingTime = (proposedDate) => {
  const now = new Date();
  const bookingDate = new Date(proposedDate);
  const bookingHour = bookingDate.getHours();
  
  if (bookingDate < now) {
    return {
      isValid: false,
      message: "Không thể đặt lịch trong quá khứ"
    };
  }

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  if (bookingDate > maxDate) {
    return {
      isValid: false,
      message: "Chỉ được đặt lịch trong vòng 30 ngày tới"
    };
  }

  if (bookingHour < 8 || bookingHour > 20) {
    return {
      isValid: false,
      message: "Chỉ được đặt lịch xem phòng từ 8h sáng đến 20h tối"
    };
  }

  return { isValid: true };
};

module.exports = { validateBookingTime }; 