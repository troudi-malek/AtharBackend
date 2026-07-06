const mongoose=require('mongoose')
const options = { discriminatorKey: 'kind', collection: 'users',timestamps: true  };
const userSchema=new mongoose.Schema({
    username:{type:String,required:true},
    email:{type:String,unique:true,required:true},
    password:{type:String,required:true},
    phoneNumber:{type:String,required:false},
    profileImageUrl:{type:String,required:false},
    passwordUpdatedAt:{type:Date,required:false},
    resetCode:{type:String,required:false},
    resetCodeExpiresAt:{type:Date,required:false},
    lastlogin:{type:Date,required:false}
},options)
const User=mongoose.model('User',userSchema);
module.exports=User;