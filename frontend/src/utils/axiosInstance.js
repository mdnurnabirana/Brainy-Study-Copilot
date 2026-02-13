import axios from "axios";
import { BASE_URL } from "./apiPath";

const axiosInstance = axios.create({
  //don’t have to repeat the same settings for every request
  baseURL: BASE_URL,
  timeout: 80000, //If the server does not respond within 80 seconds, Axios will throw an error
  headers: {
    "Content-Type": "application/json", //Tells the server you are sending JSON data
    Accept: "application/json", //Tells the server you expect JSON data in return.
  },
});

// Request Interceptor-> //TODO An interceptor is a function that lets you intercept (catch and modify) a request or response before it is handled by your application.
axiosInstance.interceptors.request.use(
  //It runs before every HTTP request is sent
  (config) => {
    //config is the request configuration object (URL, headers, body, etc.)
    const accessToken = localStorage.getItem("token"); //Fetches the saved JWT token from localStorage
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

//Response Interceptor->This is a response interceptor. It runs after your server responds but before your code receives the result
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 500) {
        console.error("Server error. Please try again later.");
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout.Please try again.");
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;