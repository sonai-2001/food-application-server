import mongoose from "mongoose";

//* Creating a sellerSchema ~

const sellerSchema = new mongoose.Schema({
  ownerName: {
    type: String,
    required: true,
    unique: true,
  },
  resturentName: {
    type: String,
    required: true,
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
  isVerified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    default: "Seller",
  },
});

// TODO : later we need to add the address field ...

//* saving the schema ~
const Seller = mongoose.model("Seller", sellerSchema);
export default Seller;

