const mongoose=require('mongoose')

const UserMuseumAccessSchema =new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User',required:true },
  museum: { type: mongoose.Schema.Types.ObjectId, ref: 'Museum',required:true },
  purchased: { type: Boolean, default: false },
  visitedExperiences: [{
    experienceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Experience',required:true },
    visitedAt: { type: Date, default: Date.now }
  }]
},{ timestamps: true })
const UserMuseumAccess=mongoose.model('UserMuseumAccess',UserMuseumAccessSchema);
module.exports=UserMuseumAccess;