import mongoose from "mongoose";

const CarSchema = new mongoose.Schema(
{
id:Number,
name:String,
brand:String,
model:String,
slug:String,
launchYear:Number,
bodyType:String,

priceRange:{
min:Number,
max:Number
},

priceDisplay:String,
image:String,
images:[String],

rating:Number,
reviews:Number,

overview:String,

keyHighlights:[String],

specifications:Object,
safety:Object,
features:Object,
variants:[Object],

competitors:[Number],
keywords:[String],

isPopular:Boolean,
isUpcoming:Boolean,
isElectric:Boolean,

segment:String

},
{timestamps:true}
);

export default mongoose.models.Car || mongoose.model("Car",CarSchema);