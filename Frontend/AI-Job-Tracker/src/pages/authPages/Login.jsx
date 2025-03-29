import React from "react";
import { useState, useContext } from "react";
import { login } from "../../api/auth.api";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './authstyles.css';
import { AuthContext } from "../../context/AuthProvider";

export const Login = () => {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const incIsRegistered = () => {
    navigate("/signup");
  };
  //navigate to home page if user aleay exist
 
      if (auth.user !== null) {
        navigate("/");
      }
  
  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = login(formData);
      console.log((await res).data.user.fullname);
      alert(`welcome back ${(await res).data.user.fullname}`);
      navigate("/");
    } catch (err) {
      console.error(err.response?.data?.msg || " User not found please register");
    }
  };

  return (
    <div id="login">
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
      <button onClick={incIsRegistered}>Register</button>
    </div>
  );
};
