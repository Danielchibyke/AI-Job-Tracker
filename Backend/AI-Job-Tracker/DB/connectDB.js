import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const connDB = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected successfully to:', connDB.connection.host);
    return connDB;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); // Exit with failure
  }
};

export default connectDB;