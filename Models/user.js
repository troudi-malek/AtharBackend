const mongoose=require('mongoose')
const options = { discriminatorKey: 'kind', collection: 'users',timestamps: true  };
const userSchema=new mongoose.Schema({
    username:{type:String,required:true},
    email:{type:String,unique:true,required:true},
    password:{type:String,required:true},
},options)
const User=mongoose.model('User',userSchema);
module.exports=User;