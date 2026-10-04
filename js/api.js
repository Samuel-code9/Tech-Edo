const BASE_URL = "https://final-project-n7u6.onrender.com/Tour-Edo";

function getToken() {
  return localStorage.getItem("touredo_token");
}

async function request(path, { method = "GET", body, isFormData = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isFormData) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.msg || `Request failed (${res.status})`);
  }
  return data;
}

const api = {
  signUp: (data) => request("/auth/signup", { method: "POST", body: data }),
  login: (data) => request("/auth/login", { method: "POST", body: data }),
  forgotPassword: (data) => request("/auth/forgot-password", { method: "POST", body: data }),
  resetPassword: (token, data) => request(`/auth/reset-password/${token}`, { method: "POST", body: data }),

  getAttractions: (query = "") => request(`/attraction${query}`),
  getAttraction: (id) => request(`/attraction/${id}`),
  createAttraction: (data) => request("/attraction", { method: "POST", body: data }),
  updateAttraction: (id, data) => request(`/attraction/${id}`, { method: "PUT", body: data }),
  deleteAttraction: (id) => request(`/attraction/${id}`, { method: "DELETE" }),
  uploadAttractionImage: (id, formData) => request(`/attraction/${id}/image`, { method: "POST", body: formData, isFormData: true }),

  getHotels: (query = "") => request(`/hotel${query}`),
  getHotel: (id) => request(`/hotel/${id}`),
  createHotel: (data) => request("/hotel", { method: "POST", body: data }),
  updateHotel: (id, data) => request(`/hotel/${id}`, { method: "PUT", body: data }),
  deleteHotel: (id) => request(`/hotel/${id}`, { method: "DELETE" }),
  uploadHotelImage: (id, formData) => request(`/hotel/${id}/image`, { method: "POST", body: formData, isFormData: true }),

  getEvents: (query = "") => request(`/event${query}`),
  getEvent: (id) => request(`/event/${id}`),
  createEvent: (data) => request("/event", { method: "POST", body: data }),
  updateEvent: (id, data) => request(`/event/${id}`, { method: "PUT", body: data }),
  deleteEvent: (id) => request(`/event/${id}`, { method: "DELETE" }),

  createBooking: (data) => request("/booking", { method: "POST", body: data }),
  getMyBookings: () => request("/booking/mybookings"),
  getBooking: (id) => request(`/booking/${id}`),
  cancelBooking: (id) => request(`/booking/${id}/cancel`, { method: "PUT" }),
  getAllBookings: () => request("/booking"),
  updateBookingStatus: (id, data) => request(`/booking/${id}/status`, { method: "PUT", body: data }),

  addReview: (data) => request("/review", { method: "POST", body: data }),
  getReviewsForAttraction: (id) => request(`/review/attraction/${id}`),
  getMyReviews: () => request("/review/myreviews"),
  updateReview: (id, data) => request(`/review/${id}`, { method: "PUT", body: data }),
  deleteReview: (id) => request(`/review/${id}`, { method: "DELETE" }),

  initializePayment: (data) => request("/payment/initialize", { method: "POST", body: data }),
  verifyPayment: (reference) => request(`/payment/verify/${reference}`),

  getRecommendations: (data) => request("/recommendation", { method: "POST", body: data }),

  getUsers: () => request("/user"),
  getUser: (id) => request(`/user/${id}`),
  updateUserRole: (id, data) => request(`/user/${id}/role`, { method: "PUT", body: data }),
  deleteUser: (id) => request(`/user/${id}`, { method: "DELETE" }),
};
