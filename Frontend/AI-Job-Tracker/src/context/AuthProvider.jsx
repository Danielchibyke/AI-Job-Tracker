import { createContext, useState, useContext, useEffect } from "react";

import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};
export const AuthProvider = ({ children }) => {
  // console.log(useAuth())
  const [user, setUser] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // console.log(user);

    const publicRoutes = ["/login", "/signup"];
    if (publicRoutes.includes(location.pathname)) {
      return;
    }

    axios
      .get("http://localhost:3000/api/auth/welcome", { withCredentials: true })
      .then((res) => {
        setUser(res.data.user);
      })
      .catch((err) => {
        setUser(null);

        if (err.response?.status === 401) {
          navigate("/login");
        }
        // navigate("/");
      });
  }, [navigate, location.pathname]);

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};
