const Museum = require('../Models/museum');

const path = require('path');
const fs = require('fs');
//const Experience = require("../models/experience");

async function addMuseum(req, res) {
  try {
    const { name, location, description,imageUrl } = req.body;
    const nb_ArExperience = 0;
    const imageFileName = req.file ? req.file.filename : null;

    // if (!imageFileName) {
    //   return res.status(400).json({ message: "Image is required" });
    // }

    // // Prepare image filename with ID placeholder
    // const ext = path.extname(imageFileName);
    const tempMuseum = new Museum(); // temp instance to get ID
    // const newFileName = `${path.basename(imageFileName, ext)}-${tempMuseum._id}${ext}`;
    // const oldPath = path.join(__dirname, '../public/uploads', imageFileName);
    // const newPath = path.join(__dirname, '../public/uploads', newFileName);

    //fs.renameSync(oldPath, newPath);

    // Create museum with finalized imageUrl
    tempMuseum.name = name;
    tempMuseum.location = location;
    tempMuseum.description = description;
    //tempMuseum.imageUrl = newFileName;
    tempMuseum.imageUrl = imageUrl;
    tempMuseum.nb_ArExperience = nb_ArExperience;

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
    console.log('tneket')
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

    // Find existing museum
    const museum = await Museum.findById(req.params.id);

    if (!museum) {
      return res.status(404).json({ error: "Museum not found" });
    }

    // Update fields
    museum.name = name || museum.name;
    museum.location = location || museum.location;
    museum.description = description || museum.description;

    // Handle new image upload if provided
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

module.exports = {
  addMuseum,
  getAllMuseums,
  updateMuseum,
  deleteMuseum,
};
