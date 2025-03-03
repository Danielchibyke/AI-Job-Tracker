import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Login } from "./pages/authPages/Login";
import Signup from "./pages/authPages/Signup";
import "./App.css";
import { Home } from "./pages/Home";
import { AuthProvider } from "./context/AuthProvider";
import { Protected } from "./api/protected";
import { Dashboard } from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/signup" element={<Signup />}></Route>
          <Route path="/login" element={<Login />}></Route>

          <Route path="/dashboard" 
          element={<Dashboard />}>
           
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
