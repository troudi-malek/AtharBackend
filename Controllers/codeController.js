const Code = require("../Models/code");
const Museum = require("../Models/museum");
const User = require("../Models/user");
const UserMuseumAccess = require("../Models/userMuseumAccess");

async function generateCode(req, res) {
  try {
    const nbCodes = req.body.nbCodes;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let ListCodes = [];

    while (ListCodes.length < nbCodes) {
      let result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const existing = await Code.findOne({ code: result });
      if (!existing && !ListCodes.includes(result)) {
        ListCodes.push(result);

        const newCode = new Code({
          code: result,
          submited: false,
          idMuseum: req.body.idMuseum,
        });

        await newCode.save();
      }
    }

    res.status(201).json({
      message: 'Codes generated successfully',
      data: ListCodes,
    });

  } catch (error) {
    res.status(500).json({
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
}


async function getAllCodes(req, res) {
  try {
    const allCodes = await Code.find({submited:false});

    res.status(200).json(allCodes);
  } catch (error) {
    res.status(500).json({
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
}

async function SubmitCode(req,res){
  try{
    const code= req.body.code;
    const idMuseum=req.body.idMuseum;
    const idUser=req.body.idUser;
    console.log(code);
    console.log(idMuseum);
    console.log(idUser)
    const CodeData=await Code.findOne({code});
    if(!CodeData){
      return res.status(401).json({ error: 'Code is invalid' });
    }
    const museum= await Museum.findById(idMuseum);
    if(!museum){
      return res.status(401).json({ error: 'No Museum found' });
    }
    const user=await User.findById(idUser);
    if(!user){
      return res.status(401).json({ error: 'User not found' });
    }
    if(CodeData.submited == true){
      return res.status(401).json({ error: 'Code is already submitted' });
    }
    const userMuseumAccess = new UserMuseumAccess({user:idUser,museum:idMuseum,purchased:true});
    CodeData.submited = true;
    await CodeData.save();
    await userMuseumAccess.save();
    res.status(201).json({
      message: 'Code Submitted Successfully',
      data: userMuseumAccess,
    });
  }catch(error){
    res.status(500).json({
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
}


async function deleteCode(req, res) {
  try {
    const deletedCode = await Code.findByIdAndDelete(req.params.id);

    if (!deletedCode) {
      return res.status(404).json({ error: "Code not found" });
    }

    res.status(200).json({ message: "Code deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
}

module.exports = {
  getAllCodes,
  deleteCode,
  generateCode,
  SubmitCode,
};
