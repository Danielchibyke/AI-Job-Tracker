import jwt from 'jsonwebtoken';

const generateTokenAndSetCookie = async (res, userid) => {
  const token = jwt.sign({ userid }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  const cookieOptions = {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
    cookieOptions.sameSite = 'none';
    // The domain should be set by the production environment, not hardcoded
    // cookieOptions.domain = 'ai-job-tracker-6ekq.onrender.com'; 
  } else {
    // For local development
    cookieOptions.secure = false;
    cookieOptions.sameSite = 'lax';
  }

  res.cookie('token', token, cookieOptions);
  
  return token;
};

export default generateTokenAndSetCookie;