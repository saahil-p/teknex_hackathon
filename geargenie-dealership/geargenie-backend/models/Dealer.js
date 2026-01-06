import mongoose from "mongoose";

const dealerSchema = new mongoose.Schema({
  name: String,
  garageName: String,    // NEW FIELD
  email: String,
  password: String,
});

const Dealer = mongoose.model("Dealer", dealerSchema);
export default Dealer;
