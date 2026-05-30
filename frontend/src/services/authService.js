import api from "./api";

const AuthService = {
  // Register a new student
  register: async (data) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  // Login
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { data } = response.data;

    // Persist token & user
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
  },

  // Logout (client-side only)
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Fetch current user from API
  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data.data.user;
  },

  // Change password
  changePassword: async (current_password, new_password) => {
    const response = await api.put("/auth/change-password", {
      current_password,
      new_password,
    });
    return response.data;
  },

  // Read persisted user (no API call)
  getLocalUser: () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  },

  isAuthenticated: () => !!localStorage.getItem("token"),
};

export default AuthService;
