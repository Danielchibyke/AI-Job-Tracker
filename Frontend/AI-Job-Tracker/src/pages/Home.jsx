import React, { useState, useContext } from "react";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import { Dashboard} from "./Dashboard";
import { logout } from "../api/auth.api";
import { AuthContext } from "../context/AuthProvider";
import "./home.style.css";

 
 export const Home = () => {
      const authCtx = useContext(AuthContext);
      console.log(authCtx)
       console.log('Home')
    return (
      <>
      <nav>
         logout
      </nav>
          <Dashboard />
         <p>Home page</p>  
         <button onClick={logout}>log out</button>
      </>  
    )
 }
 