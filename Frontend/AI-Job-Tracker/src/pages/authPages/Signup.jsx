import { useState } from "react";
import axios from "axios";
import {login, signup} from "../../api/auth.api.js";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

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
      const res = signup(formData)
      alert("User registered successfully");
      console.log(res.data);
    } catch (err) {
      console.error(err.response?.data?.msg || "Registration failed");
    }
  };
   const gotoLogin =()=>{
    navigate("/login");
   }

  return (
    <>
   
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="fullname"
        placeholder="Enter your name"
        value={formData.fullname}
        onChange={handleChange}
        required
      />
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
      <button type="submit">Sign Up</button>
    </form>
    <button onClick={gotoLogin}>Login</button>
    </>
  );
};

export default Signup;