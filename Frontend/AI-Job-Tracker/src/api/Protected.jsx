import {Navigate, Outlet} from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";


import React from 'react'

export const Protected = ({children}) => {
    
   const {user} =useAuth();
//    console.log('protect'  + user)
   if(user === null){
    return <Navigate to="/login" />
   }
       return children 
}
