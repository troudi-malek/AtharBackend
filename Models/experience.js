const mongoose=require('mongoose')

const experienceSchema=new mongoose.Schema({
    idMuseum:{type:mongoose.Schema.Types.ObjectId,ref:'Museum',required:true},
    name:{type:String,required:true},
    description:{type:String,required:true},
    Access_code:{type:String,required},
    type: {type: String,enum: ['prem', 'free'],required: true}
},{ timestamps: true });
const Experience = mongoose.model('Experience', experienceSchema);
module.exports = Experience;