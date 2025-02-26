import express from "express";
import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { generateVerificationToken } from "../utils/generateVerificationCode.js";
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.js";
const app = express();
app.use(express.json());

export const signUp = async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    if (!email || !password || !fullname) {
      throw new error("all field are required!");
    }
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "user already exists" });
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
    return res.status(400).json({ sucess: false, message: error.message });
  }
};

// Login function

export const login = async (req, res) => {
  const { email, password } = req.body;
  const getUser = async (User) => {
    const data = await User.findOne({ email: email });
    return data;
  };

  const userInDb = await getUser(User);
  console.log(userInDb);

  // i have to check user password whether it matches and email
  try {
    if (!email || !password) {
      return res
        .statu(400)
        .json({ success: false, message: "Field is empty!" });
    }
    if (!userInDb) {
      return res
        .status(400)
        .json({ success: false, message: `User not found please sign up!` });
    }
    const isMatch = await bcryptjs.compare(password, userInDb.password);

    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalide Credential!" });

    return res
      .status(202)
      .json({ sucess: true, message: `welcome back ${email}` });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};
export const logout = async (req, res) => {
  res.send("logout route");
};

//http://localhost:3000/api/auth/login
// {
//   "email": "henry@gmail.com",
//   "password": "1111"
// }
