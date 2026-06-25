import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    default: "dealer"
  },
  city: String
});

export default mongoose.models.User || mongoose.model("User", UserSchema);