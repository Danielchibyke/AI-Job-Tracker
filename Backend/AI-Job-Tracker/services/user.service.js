import express from "express";
import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { generateVerificationToken } from "../utils/generateVerificationCode.js";
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.js";
const app = express();
app.use(express.json());

class UserService {
  constructor() {}
        //signUp user
        signUp = async (req, res) => {
            const { fullname, email, password } = req.body;

            try {
            if (!email || !password || !fullname) {
                throw new error("all field are required!");
            }
            const userAlreadyExists = await User.findOne({ email });
            if (userAlreadyExists) {
                return res
                .status(400)
                .json({ sucess: false, message: "user already exists" });
            }

            const hashedPassword = await bcryptjs.hash(password, 10);
            const verificationToken = await generateVerificationToken(); // generates random code

            const user = new User({
                fullname,
                email,
                password: hashedPassword,
                verificationToken,
                verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, //24 hours
            });
            await user.save();

            //jwt

            generateTokenAndSetCookie(res, user._id);

            res.status(201).json({
                success: true,
                message: "user created successfully",
                //I want to return user but also I don't want to return the password
                user: {
                ...user._doc,
                password: null,
                },
            });
            } catch (error) {
            return res.status(400).json({ sucess: false, message: "can't signup" });
            }
        };

        // Login User
        login = async (req, res) => {
            const { email, password } = req.body;
            const getUser = async (User) => {
            const data = await User.findOne({ email: email });
            return data;
            };
        
            const userInDb = await getUser(User);
            
            // i have to check user password whether it matches and email
            try {
            if (!email || !password) {
                return res
                .statu(400)
                .json({ sucess: false, message: "Field is empty!" });
            }
            if (!userInDb) {
                return res
                .status(401)
                .json({ sucess: false, message: `User not found please sign up!` });
            }
            const isMatch = await bcryptjs.compare(password, userInDb.password);
        
            if (!isMatch)
                return res
                .status(400)
                .json({ sucess: false, message: "Invalide Credential!" });
        
            if(isMatch){ 
            generateTokenAndSetCookie(res, userInDb._id);
            return res
                .status(202)
                .json({ sucess: true, user:{ ...userInDb._doc, password:null}, message: `welcome back ${email}` });
            }
            
            } catch (error) {
            return res.status(500).json({ message: error });
            }
        };

        // Logout function
        logout = async (req, res) => {
            try {
            const user = await User.findById(req.user.userid);
            const token = req.cookies.token;
            if(!token){
                console.log('no token');
                return res.status(400).json({sucess: false, message: 'no active session'});
            }
                res.clearCookie("token", {httpOnly: true, secure: true, sameSite: "strict"});
                res.status(200).json({message: 'Bye'+' '+ user.fullname });
            } catch (error) {
            console.log(error)
            }
        };

        //welcome route used to get existing user from req
        welcome = async (req, res) => {
            try {
            const user = await User.findById(req.user.userid);
            res
                .status(201)
                .json({
                sucess: true,
                user: { ...user._doc, password: null },
                message: "you have access",
                });
            } catch (error) {
            res.status(401).json({ sucess: false, message: "access denied" + error });
            }
        };
        
}
export default new UserService