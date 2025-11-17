import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services/api";

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      const publicRoutes = ["/", "/login", "/signup", "/features"];
      if (publicRoutes.includes(location.pathname)) {
        return;
      }

      try {
        const data = await authService.getCurrentUser();
        if (data && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
          navigate("/login");
        }
      } catch (error) {
        setUser(null);
        if (error.statusCode === 401) {
          navigate("/login");
        }
      }
    };

    checkUser();
  }, [navigate, location.pathname]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>
  );
};
