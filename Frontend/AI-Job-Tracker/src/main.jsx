import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {BrowserRouter as Router, Routes, Route, Link} from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthProvider";

createRoot(document.getElementById("root")).render(
<StrictMode>
  <Router>
    <AuthProvider>
      <Routes>
        <Route path="*" element={<App/>}>
        </Route>
      </Routes>
       </AuthProvider>
  </Router>
</StrictMode>
 
);
