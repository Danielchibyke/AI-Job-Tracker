import jwt from 'jsonwebtoken';

const generateTokenAndSetCookie = async (res, userid)=>{
    const token = jwt.sign({userid}, process.env.JWT_SECRET,{
        expiresIn: '7d',
    });

    res.cookie('token', token, {
        httpOnly: true, // prevents xss attack
        secure: process.env.MODE_ENV === 'production', 
        sameSite: 'lax',
        maxAge: 7*24*60*60*1000,
    });
    return token
}
 export default generateTokenAndSetCookie