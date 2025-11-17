import { useState, useContext } from "react";
import { authService } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";

const Signup = () => {
  const { setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.signup(formData);
      const loginData = await authService.login({ email: formData.email, password: formData.password });
      if (loginData && loginData.user) {
        setUser(loginData.user);
        toast.success("User registered and logged in successfully");
        navigate("/onboarding");
      } else {
        toast.error("Signup succeeded but login failed");
      }
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const gotoLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Full Name"
            type="text"
            name="fullname"
            id="fullname"
            placeholder="Enter your name"
            value={formData.fullname}
            onChange={handleChange}
            required
          />
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
            Sign Up
          </Button>
        </form>
        <div className="mt-6 text-center">
          <span className="text-white">Already have an account?</span>
          <button
            onClick={gotoLogin}
            className="ml-2 text-blue-300 hover:underline focus:outline-none"
            type="button"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;