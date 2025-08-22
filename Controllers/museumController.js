const Museum = require('../Models/museum');

const path = require('path');
const fs = require('fs');
const UserMuseumAccess = require('../Models/userMuseumAccess');
//const Experience = require("../models/experience");

async function addMuseum(req, res) {
  try {
    const { name, location, description,imageUrl } = req.body;
    const nb_ArExperience = 0;
    const totalVisits=0;
    const imageFileName = req.file ? req.file.filename : null;

    if (!imageFileName) {
      return res.status(400).json({ message: "Image is required" });
    }
    const ext = path.extname(imageFileName);
    const tempMuseum = new Museum();
    const newFileName = `${path.basename(imageFileName, ext)}-${tempMuseum._id}${ext}`;
    const oldPath = path.join(__dirname, '../public/uploads', imageFileName);
    const newPath = path.join(__dirname, '../public/uploads', newFileName);

    fs.renameSync(oldPath, newPath);
    tempMuseum.name = name;
    tempMuseum.location = location;
    tempMuseum.description = description;
    //tempMuseum.imageUrl = newFileName;
    tempMuseum.imageUrl = newFileName;
    tempMuseum.nb_ArExperience = nb_ArExperience;
    tempMuseum.totalVisits= totalVisits;

    await tempMuseum.save();

    res.status(201).json({ success: true, data: tempMuseum });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
}


async function getAllMuseums(req, res) {
  try {
    const museums = await Museum.find();
    res.status(200).json(museums);
  } catch (error) {
    res.status(500).json({
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
}

async function updateMuseum(req, res) {
  try {
    const { name, location, description } = req.body;
    const imageFile = req.file;
    const museum = await Museum.findById(req.params.id);

    if (!museum) {
      return res.status(404).json({ error: "Museum not found" });
    }
    museum.name = name || museum.name;
    museum.location = location || museum.location;
    museum.description = description || museum.description;

    if (imageFile) {
      const ext = path.extname(imageFile.filename);
      const newFileName = `${path.basename(imageFile.filename, ext)}-${museum._id}${ext}`;
      const oldPath = path.join(__dirname, '../public/uploads', imageFile.filename);
      const newPath = path.join(__dirname, '../public/uploads', newFileName);

      fs.renameSync(oldPath, newPath);
      museum.imageUrl = newFileName;
    }

    await museum.save();

    res.status(200).json({
      message: "Museum updated successfully",
      data: museum,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
}

async function deleteMuseum(req, res) {
  try {
    const deletedMuseum = await Museum.findByIdAndDelete(req.params.id);

    if (!deletedMuseum) {
      return res.status(404).json({ error: "Museum not found" });
    }

    res.status(200).json({ message: "Museum deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
}

async function GetMuseumByID(req,res){
  try{
    const museum = await Museum.findById(req.params.id);
    console.log(req.params.id)
  if (!museum) {
      return res.status(404).json({ error: "Museum not found" });
    }
    console.log(museum)

    res.status(200).json({ message: "Museum found",data:museum });
  }catch(error){
    res.status(500).json({
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
}

async function GetMuseumListForUser(req, res) {
  try {
    const userId = req.params.id; 
    const museumList = await Museum.find();
    const accessList = await UserMuseumAccess.find({ user: userId, purchased: true });
    const ownedMuseumIds = new Set(accessList.map(a => a.museum.toString()));
    const museumsWithOwnership = museumList.map(museum => ({
      _id: museum._id,
      name: museum.name,
      location: museum.location,
      imageUrl: museum.imageUrl,
      description : museum.description,
      nb_ArExperience: museum.nb_ArExperience,
      owned: ownedMuseumIds.has(museum._id.toString()),
    }));

    res.json({ museums: museumsWithOwnership });
  } catch (error) {
    res.status(500).json({
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
}


async function GetMuseumListForLoggedOffUser(req, res) {
  try {
    const museumList = await Museum.find();
    const museumsWithOwnership = museumList.map(museum => ({
      _id: museum._id,
      name: museum.name,
      location: museum.location,
      imageUrl: museum.imageUrl,
      nb_ArExperience: museum.nb_ArExperience,
      owned: false,
    }));

    res.json({ museums: museumsWithOwnership });
  } catch (error) {
    res.status(500).json({
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
}
module.exports = {
  addMuseum,
  getAllMuseums,
  updateMuseum,
  deleteMuseum,
  GetMuseumByID,
  GetMuseumListForUser,
  GetMuseumListForLoggedOffUser
};
