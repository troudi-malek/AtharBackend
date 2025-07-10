const mongoose = require('mongoose');
const User = require('./user');

const adminSchema = new mongoose.Schema({
    mangedMuseum:{type:mongoose.Schema.Types.ObjectId,ref:'Museum',required:true}
},{ timestamps: true });

const Admin = User.discriminator('Admin', adminSchema);
module.exports = Admin;
