import mongoose from "mongoose";

//* Creating a foodSchema ~

const foodSchema = new mongoose.Schema({
  foodName: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
  },
  resturentName: {
    type: String,
    required: true,
  },
});

//* saving the schema ~
const Food = mongoose.model("Food", foodSchema);
export default Food;
