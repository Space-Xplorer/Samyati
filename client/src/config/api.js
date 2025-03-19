const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

export const API_ENDPOINTS = {
  blogs: `${API_BASE_URL}/api/blogs`,
  users: `${API_BASE_URL}/api/users`,
  admin: `${API_BASE_URL}/api/admin`,
}

export default API_BASE_URL

