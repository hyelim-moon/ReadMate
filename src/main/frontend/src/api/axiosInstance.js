import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8080/api", // 백엔드 API 기본 주소
    withCredentials: true, // 필요 시 (쿠키 인증 등)
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("ACCESS_TOKEN");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;
