const Museum = require('../Models/museum');

const path = require('path');
const fs = require('fs');
const UserMuseumAccess = require('../Models/userMuseumAccess');
const Code = require('../Models/code');
const Experience = require('../Models/experience');
const mongoose = require('mongoose');
const Admin = require('../Models/admin');
//const Experience = require("../models/experience");

async function addMuseum(req, res) {
  try {
    const { name, location, description, imageUrl, cost, email, phone } = req.body;
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
    tempMuseum.cost = cost;
    if (email !== undefined) tempMuseum.email = email;
    if (phone !== undefined) tempMuseum.phone = phone;

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
    const { name, location, description, cost, email, phone } = req.body;
    const imageFile = req.file;
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid museum id" });
    }
    const museum = await Museum.findById(req.params.id);

    if (!museum) {
      return res.status(404).json({ error: "Museum not found" });
    }
    museum.name = name || museum.name;
    museum.location = location || museum.location;
    museum.description = description || museum.description;
    if (cost !== undefined) {
      if (cost === '') {
        // Ignore empty string to avoid invalid cast to Number
      } else {
        const parsedCost = Number(cost);
        if (Number.isNaN(parsedCost)) {
          return res.status(400).json({ error: "Invalid cost value" });
        }
        museum.cost = parsedCost;
      }
    }
    museum.email = email !== undefined ? email : museum.email;
    museum.phone = phone !== undefined ? phone : museum.phone;

    if (imageFile) {
      const ext = path.extname(imageFile.filename);
      const newFileName = `${path.basename(imageFile.filename, ext)}-${museum._id}${ext}`;
      const oldPath = path.join(__dirname, '../public/uploads', imageFile.filename);
      const newPath = path.join(__dirname, '../public/uploads', newFileName);
      // Remove previous image if it exists
      if (museum.imageUrl) {
        const previousImagePath = path.join(__dirname, '../public/uploads', museum.imageUrl);
        try {
          if (fs.existsSync(previousImagePath)) {
            fs.unlinkSync(previousImagePath);
          }
        } catch (e) {
          console.error('Failed to remove previous image:', e.message);
        }
      }
      fs.renameSync(oldPath, newPath);
      museum.imageUrl = newFileName;
    }

    await museum.save();

    res.status(200).json({
      message: "Museum updated successfully",
      data: museum,
    });
  } catch (error) {
    console.error(error.message);
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
    const museumId = req.params.id;
    const museum = await Museum.findById(museumId);
    console.log(req.params.id)
  if (!museum) {
      return res.status(404).json({ error: "Museum not found" });
    }
    console.log(museum)

    // 1) Code Redemption Percentage
    const [totalCodes, redeemedCodes] = await Promise.all([
      Code.countDocuments({ idMuseum: museumId }),
      Code.countDocuments({ idMuseum: museumId, submited: true })
    ]);
    const codeRedemptionPercentage = totalCodes > 0 ? (redeemedCodes / totalCodes) * 100 : 0;

    // 2) Daily Visits (today)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const museumObjectId = new mongoose.Types.ObjectId(museumId);

    const dailyVisitsAgg = await UserMuseumAccess.aggregate([
      { $match: { museum: museumObjectId } },
      { $unwind: '$visitedExperiences' },
      { $match: { 'visitedExperiences.visitedAt': { $gte: startOfToday, $lte: endOfToday } } },
      { $count: 'count' }
    ]);
    const dailyVisits = dailyVisitsAgg.length > 0 ? dailyVisitsAgg[0].count : 0;

    // 3) Experiences views that belong to that museum (per experience)
    const experienceViewsAgg = await UserMuseumAccess.aggregate([
      { $match: { museum: museumObjectId } },
      { $unwind: '$visitedExperiences' },
      { $group: { _id: '$visitedExperiences.experienceId', totalViews: { $sum: 1 } } }
    ]);

    const experienceIds = experienceViewsAgg.map(e => e._id);
    let experiencesMap = {};
    if (experienceIds.length > 0) {
      const experiences = await Experience.find({ _id: { $in: experienceIds }, idMuseum: museumId }, 'name _id');
      experiencesMap = experiences.reduce((acc, exp) => {
        acc[String(exp._id)] = exp.name;
        return acc;
      }, {});
    }
    const experienceViews = experienceViewsAgg
      .filter(e => experiencesMap[String(e._id)] !== undefined)
      .map(e => ({
        experienceId: e._id,
        name: experiencesMap[String(e._id)],
        totalViews: e.totalViews
      }));

    res.status(200).json({ message: "Museum found", data: museum, codeRedemptionPercentage, dailyVisits, experienceViews });
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
      cost: museum.cost,
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
      description: museum.description,
      imageUrl: museum.imageUrl,
      nb_ArExperience: museum.nb_ArExperience,
      cost: museum.cost,
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

async function calculateMuseumIncome(req, res) {
  try {
    const museumId = req.params.id;
    const museum = await Museum.findById(museumId);
    if (!museum) {
      return res.status(404).json({ error: 'Museum not found' });
    }
    const purchaseCount = await UserMuseumAccess.countDocuments({ museum: museumId, purchased: true });
    const income = museum.cost * purchaseCount;
    res.status(200).json({ museumId, income, cost: museum.cost, purchaseCount });
  } catch (error) {
    res.status(500).json({
      message: 'An unexpected error occurred',
      error: error.message,
    });
  }
}

async function getPlatformStats(req, res) {
  try {
    const [totalMuseums, allMuseums, purchasedAccessCount, activeAdmins] = await Promise.all([
      Museum.countDocuments({}),
      Museum.find({}, '_id cost'),
      UserMuseumAccess.countDocuments({ purchased: true }),
      Admin.countDocuments({})
    ]);

    // Cumulative visits: count of all visitedExperiences events across all museums
    const cumulativeVisitsAgg = await UserMuseumAccess.aggregate([
      { $unwind: '$visitedExperiences' },
      { $count: 'count' }
    ]);
    const cumulativeVisits = cumulativeVisitsAgg.length > 0 ? cumulativeVisitsAgg[0].count : 0;

    // Total revenue: sum over museums of cost * purchasedCount(museum)
    const museumIds = allMuseums.map(m => m._id);
    let totalRevenue = 0;
    if (museumIds.length > 0) {
      const purchasesByMuseum = await UserMuseumAccess.aggregate([
        { $match: { museum: { $in: museumIds }, purchased: true } },
        { $group: { _id: '$museum', count: { $sum: 1 } } }
      ]);

      const costByMuseumId = new Map(allMuseums.map(m => [String(m._id), Number(m.cost) || 0]));
      totalRevenue = purchasesByMuseum.reduce((sum, p) => {
        const cost = costByMuseumId.get(String(p._id)) || 0;
        return sum + cost * p.count;
      }, 0);
    }

    res.status(200).json({
      totalMuseums,
      cumulativeVisits,
      totalRevenue,
      activeAdmins
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An unexpected error occurred', error: error.message });
  }
}

async function getAllMuseumsIncome(req, res) {
  try {
    const museums = await Museum.find({}, '_id name cost');
    const museumIds = museums.map(m => m._id);
    if (museumIds.length === 0) {
      return res.status(200).json([]);
    }

    const purchasesByMuseum = await UserMuseumAccess.aggregate([
      { $match: { museum: { $in: museumIds }, purchased: true } },
      { $group: { _id: '$museum', count: { $sum: 1 } } }
    ]);

    const purchaseCountByMuseumId = new Map(purchasesByMuseum.map(p => [String(p._id), p.count]));

    const results = museums.map(m => {
      const count = purchaseCountByMuseumId.get(String(m._id)) || 0;
      const income = (Number(m.cost) || 0) * count;
      return { museumId: m._id, name: m.name, income, purchaseCount: count };
    });

    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An unexpected error occurred', error: error.message });
  }
}

module.exports = {
  addMuseum,
  getAllMuseums,
  updateMuseum,
  deleteMuseum,
  GetMuseumByID,
  GetMuseumListForUser,
  GetMuseumListForLoggedOffUser,
  calculateMuseumIncome,
  getPlatformStats,
  getAllMuseumsIncome
};
