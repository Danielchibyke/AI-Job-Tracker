import mongoose from "mongoose";

  const connectDB = async() => {
   try {
    const connDB = await mongoose.connect(process.env.MONGODB_URI);
    console.log('mongoDB is connected to' +' '+ connDB.connection.host +' '+ 'successfully')
   } catch (error) {
    console.log(error);
   }
}

export default connectDB