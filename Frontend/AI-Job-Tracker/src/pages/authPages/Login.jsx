import React, { useState, useContext, useEffect } from "react";
import { authService } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";

export const Login = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user !== null) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const incIsRegistered = () => {
    navigate("/signup");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.login(formData);
      if (data && data.user) {
        setUser(data.user);
        toast.success(`Welcome back ${data.user.fullname}`);
        navigate("/dashboard");
      } else {
        toast.error("Login failed: No user data returned");
      }
    } catch (err) {
      toast.error(err.message || "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            name="email"
            id="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            id="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <Button type="submit" loading={loading}>
            Login
          </Button>
        </form>
        <div className="mt-6 text-center">
          <span className="text-white">Don't have an account?</span>
          <button
            onClick={incIsRegistered}
            className="ml-2 text-blue-300 hover:underline focus:outline-none"
            type="button"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};
