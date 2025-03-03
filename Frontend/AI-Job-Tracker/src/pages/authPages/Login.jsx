import React from "react";
import { useState } from "react";
import { login } from "../../api/auth.api";
import { useNavigate } from "react-router-dom";
import axios from "axios";
export const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const incIsRegistered = () => {
    navigate("/signup");
  };
  //navigate to home page if user aleay exist
  axios
    .get("http://localhost:3000/api/auth/welcome", { withCredentials: true })
    .then((res) => {
      if (res.data.user) {
        navigate("/");
      }
    })
    .catch((err) => {});
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
      console.error(err.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <div>
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
