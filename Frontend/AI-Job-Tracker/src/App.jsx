import {
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useContext, useState } from "react";
import { Login } from "./pages/authPages/Login";
import Signup from "./pages/authPages/Signup";
import "./App.css";
import { AuthContext } from "./context/AuthProvider";
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import LandingPage from './pages/LandingPage';
import { Dashboard } from "./pages/Dashboard";
import Notifications from './pages/Notifications';
import Navbar from './components/Navbar';
import Profile from './pages/Profile';
import { Toaster } from 'react-hot-toast';
import AutomationMonitor from './pages/AutomationMonitor';
import Features from './pages/Features';
import JobDetails from './pages/JobDetails';
//test git

function App() {
  const location = useLocation();
  const auth = useContext(AuthContext);
  const [active, setActive] = useState("none");

  const toggleNav = () => {
    if (auth.user !== null) {
      if (active === "none") {
        setActive("flex");
      } else {
        setActive("none");
      }
    } else {
      setActive("none");
    }
  };

  const toggleNavNone = () => {
    setActive("none");
  };

  let navVisible = auth.user !== null ? 'block' : 'none';

  // Hide navbar on login, signup, onboarding
  const hideNavbar = ['/login', '/signup', '/onboarding'].includes(location.pathname);

  return (
    <>
      <Toaster position="top-right" />
      {!hideNavbar && <Navbar />}
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/onboarding" element={<OnboardingFlow />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/jobs/:id" element={<JobDetails />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/automation-monitor" element={<AutomationMonitor />} />
      <Route path="/features" element={<Features />} />
    </Routes>
    </>
  );
}

export default App;
