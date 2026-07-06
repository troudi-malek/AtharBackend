const mongoose=require('mongoose')

const codeSchema=new mongoose.Schema({
    code:{type:String,unique:true,required:true},
    submited:{type:Boolean,required:true,default:false}, 
    idMuseum:{type:mongoose.Schema.Types.ObjectId,ref:'Museum',required:true},
    qrCodeUrl:{type:String}
},{ timestamps: true });
const Code=mongoose.model('Code',codeSchema);
module.exports=Code;