import axios from "axios";
import React from "react";
import { useNavigate } from "react-router-dom";
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:3000";

// import dotenv from "dotenv";
// dotenv.config();
// const api = process.env.REACT_APP_AUTH_API_URL;

export const login = async (userData) => {
  return await axios.post(`http://localhost:3000/api/auth/login`, userData)
            .then();
};
export const signup = async (userData) => {
  await axios.post(`http://localhost:3000/api/auth/signup`, userData)
              
};
export const logout = async () =>{
  await axios.post('http://localhost:3000/api/auth/logout')
              .then( window.location.href = "/login")
}
