import React from "react";
import { useState } from "react";
import { dashboard } from "../api/auth.api";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});

  const getUser = async () => {
    if (user !== null) {
      const reqUser = await axios
        .get(`http://localhost:3000/api/auth/welcome`, {
          withCredentials: true,
        })
        .then((res) => {
         
          navigate("/dashboard");
          return res.data.user;
        })
        .catch((error) => {
          console.error();
          navigate("/login");
        });
      return setUser(reqUser);
    }
    setUser(null);
    navigate("/login");
  };
  
  return (
    <div>
      <p>{user.fullname}</p>
      <button onClick={getUser}>Dashboard</button>
    </div>
  );
};
