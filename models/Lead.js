import mongoose from "mongoose"

const LeadSchema = new mongoose.Schema({
name:String,
phone:String,
carId:{
type:mongoose.Schema.Types.ObjectId,
ref:"Car"
},
dealerId:{
type:mongoose.Schema.Types.ObjectId,
ref:"Dealer"
},
status:{
type:String,
default:"New"
}
})

export default mongoose.models.Lead || mongoose.model("Lead",LeadSchema)