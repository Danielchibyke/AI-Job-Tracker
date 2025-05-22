import axios from "axios";
import React from "react";
import { useNavigate } from "react-router-dom";
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "https://ai-job-tracker-6ekq.onrender.com";

// import dotenv from "dotenv";
// dotenv.config();
// const api = process.env.REACT_APP_AUTH_API_URL;

export const login = async (userData) => {
  return await axios.post(`https://ai-job-tracker-6ekq.onrender.com/api/auth/login`, userData)
            .then();
};
export const signup = async (userData) => {
  return await axios.post(`https://ai-job-tracker-6ekq.onrender.com/api/auth/signup`, userData);
};
export const logout = async () =>{
  await axios.post('https://ai-job-tracker-6ekq.onrender.com/api/auth/logout')
              .then( window.location.href = "/login")
}
