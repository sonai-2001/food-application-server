import mongoose from "mongoose";

//* Creating a userSchema ~

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
  },
  password: {
    type: String,
    required: true,
  },
  isVerified : {
    type : Boolean,
    default : false,
  }
});

//* saving the schema ~
const User = mongoose.model("User", userSchema);
export default User;
