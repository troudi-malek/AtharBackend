const Code = require("../Models/code");
const Museum = require("../Models/museum");
const User = require("../Models/user");
const UserMuseumAccess = require("../Models/userMuseumAccess");
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');

async function generateCode(req, res) {
  try {
    const { idMuseum } = req.body;
    const nbCodesParsed = Number.parseInt(req.body.nbCodes, 10);
    if (!idMuseum) {
      return res.status(400).json({ message: 'idMuseum is required' });
    }
    if (!Number.isFinite(nbCodesParsed) || nbCodesParsed <= 0) {
      return res.status(400).json({ message: 'nbCodes must be a positive integer' });
    }

    const nbCodes = nbCodesParsed;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let ListCodes = [];
    const qrDir = path.join(__dirname, '..', 'public', 'uploads', 'qrcodes');
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }

    while (ListCodes.length < nbCodes) {
      let result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const existing = await Code.findOne({ code: result });
      if (!existing && !ListCodes.includes(result)) {
        // generate QR code file for the code value
        const fileName = `${result}.png`;
        const filePath = path.join(qrDir, fileName);
        await QRCode.toFile(filePath, result, { type: 'png', margin: 1, width: 300 });

        const qrCodeUrl = `/uploads/qrcodes/${fileName}`;

        const newCode = new Code({
          code: result,
          submited: false,
          idMuseum,
          qrCodeUrl
        });

        await newCode.save();
        ListCodes.push({ code: result, qrCodeUrl });
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

async function submitCodeWithoutMuseumId(req, res) {
  try {
    const code = req.body.code;
    const idUser = req.body.idUser;
    console.log(code);
    console.log(idUser);
    const CodeData = await Code.findOne({ code });
    if (!CodeData) {
      return res.status(401).json({ error: 'Code is invalid' });
    }
    const idMuseum = CodeData.idMuseum;
    const museum = await Museum.findById(idMuseum);
    if (!museum) {
      return res.status(401).json({ error: 'No Museum found' });
    }
    const user = await User.findById(idUser);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    if (CodeData.submited == true) {
      return res.status(401).json({ error: 'Code is already submitted' });
    }
    const userMuseumAccess = new UserMuseumAccess({ user: idUser, museum: idMuseum, purchased: true });
    CodeData.submited = true;
    await CodeData.save();
    await userMuseumAccess.save();
    res.status(201).json({
      message: 'Code Submitted Successfully',
      data: userMuseumAccess,
    });
  } catch (error) {
    res.status(500).json({
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
}


async function getCodesByMuseum(req, res) {
  try {
    const idMuseum = req.body.idMuseum;
    if (!idMuseum) {
      return res.status(400).json({ error: 'idMuseum is required' });
    }

    const museum = await Museum.findById(idMuseum, 'name');
    if (!museum) {
      return res.status(404).json({ error: 'Museum not found' });
    }

    const codes = await Code.find({ idMuseum }, 'code submited createdAt qrCodeUrl');
    const result = codes.map((c) => ({ code: c.code, submitted: Boolean(c.submited), createdAt: c.createdAt, qrCodeUrl: c.qrCodeUrl }));
    
    return res.status(200).json({
      museumName: museum.name,
      codes: result
    });
  } catch (error) {
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
  submitCodeWithoutMuseumId,
  getCodesByMuseum,
};
