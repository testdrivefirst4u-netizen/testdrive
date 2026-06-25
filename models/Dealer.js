import mongoose from "mongoose";

const DealerSchema = new mongoose.Schema({
  name: String,
  city: String,
  phone: String,
  email: String,
});

export default mongoose.models.Dealer || mongoose.model("Dealer", DealerSchema);