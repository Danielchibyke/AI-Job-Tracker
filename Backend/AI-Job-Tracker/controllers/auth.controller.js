import express from "express";
import userService from "../services/user.service.js";
const app = express();
app.use(express.json());

class AuthController{
    constructor(userService){
      this.userService = userService;
    }
   login(req, res){
    userService.login(req, res);
   }
   logout(req, res){
    userService.logout(req, res);
   }
   signup(req,res){
    userService.signUp(req,res);
   }
   welcome(req, res){
    userService.welcome(req, res);
   }
    
}

export default new AuthController(userService)
