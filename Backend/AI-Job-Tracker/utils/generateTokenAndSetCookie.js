import jwt from 'jsonwebtoken';

const generateTokenAndSetCookie = async (res, userid)=>{
    const token = jwt.sign({userid}, process.env.JWT_SECRET,{
        expiresIn: '7d',
    });

    res.cookie('token', token, {
        httpOnly: true,
        secure: true, // Always true for HTTPS
        sameSite: 'none', // Required for cross-site cookies
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
        domain: 'ai-job-tracker-6ekq.onrender.com',
      });
    return token
}
 export default generateTokenAndSetCookie