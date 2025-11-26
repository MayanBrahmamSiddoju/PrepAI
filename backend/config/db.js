const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI =
      "mongodb+srv://kundybrahmam:Kundy%402005@venkat.jbcp8yl.mongodb.net/?retryWrites=true&w=majority&appName=venkat";

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected");
  } catch (err) {
    console.error("Error connecting to MongoDB", err);
    process.exit(1);
  }
};

module.exports = connectDB;
