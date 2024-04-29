import axios from "axios";
import Cookies from "js-cookie";

const apiRequest = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
  headers: {
    Authorization: `Bearer ${Cookies.get("token")}`,
  },
});

export default apiRequest;
