const mongoose=require('mongoose')

const museumSchema=new mongoose.Schema({
    name:{type:String,required:true},
    location:{type:String,required:true},
    imageUrl:{type:String,required:true},
    description:{type:String,required:true},
    nb_ArExperience:{type:Number,required:false},
    totalVisits:{type:Number,required:false},
    Phone:{type:String,required:false},
},{ timestamps: true });
const Museum=mongoose.model('Museum',museumSchema);
module.exports=Museum;