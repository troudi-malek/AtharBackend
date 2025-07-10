const mongoose = require('mongoose');
const User = require('./user');

const superAdminSchema = new mongoose.Schema({
},{ timestamps: true });

const superAdmin = User.discriminator('SuperAdmin', superAdminSchema);
module.exports = superAdmin;
