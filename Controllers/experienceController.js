const Experience = require('../Models/experience');
const path = require('path');
const fs = require('fs');
const Museum = require('../Models/museum');
const UserMuseumAccess = require('../Models/userMuseumAccess');

async function addExperience(req, res) {
  try {
    const { idMuseum, name, description, points } = req.body;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    let artifactImageFileName = req.file ? req.file.filename : null;
    let newFileName = null;
    if (artifactImageFileName) {
      const ext = path.extname(artifactImageFileName);
      const tempExperience = new Experience();
      newFileName = `${path.basename(artifactImageFileName, ext)}-${tempExperience._id}${ext}`;
      const oldPath = path.join(__dirname, '../public/uploads', artifactImageFileName);
      const newPath = path.join(__dirname, '../public/uploads', newFileName);
      fs.renameSync(oldPath, newPath);
      tempExperience.idMuseum = idMuseum;
      tempExperience.name = name;
      tempExperience.description = description;
      tempExperience.points = typeof points !== 'undefined' ? Number(points) : 0;
      tempExperience.Access_code = result;
      tempExperience.ArtifactImage = newFileName;
      await Museum.findByIdAndUpdate(idMuseum, { $inc: { nb_ArExperience: 1 } });
      await tempExperience.save();
      return res.status(201).json({ success: true, data: tempExperience });
    }
    // If no image is provided
    const experience = new Experience({
      idMuseum: idMuseum,
      name: name,
      description: description,
      Access_code: result,
      ArtifactImage: null,
      points: typeof points !== 'undefined' ? Number(points) : 0,
    });
    await Museum.findByIdAndUpdate(idMuseum, { $inc: { nb_ArExperience: 1 } });
    await experience.save();
    res.status(201).json({ success: true, data: experience });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'An unexpected error occurred',
      error: error.message
    });
  }
}

async function getAllExperiences(req, res) {
  try {
    const { idMuseum } = req.body;

    if (!idMuseum) {
      return res.status(400).json({ message: "idMuseum is required" });
    }

    const experiences = await Experience.find({ idMuseum }).populate('idMuseum').lean();

    // Build a list of experience IDs to compute total views for
    const experienceIds = experiences.map((exp) => exp._id);

    if (experienceIds.length === 0) {
      return res.status(200).json([]);
    }

    // Aggregate total views from UserMuseumAccess.visitedExperiences
    const counts = await UserMuseumAccess.aggregate([
      { $unwind: '$visitedExperiences' },
      {
        $match: {
          'visitedExperiences.experienceId': { $in: experienceIds }
        }
      },
      {
        $group: {
          _id: '$visitedExperiences.experienceId',
          count: { $sum: 1 }
        }
      }
    ]);

    const countMap = counts.reduce((acc, curr) => {
      acc[String(curr._id)] = curr.count;
      return acc;
    }, {});

    const enriched = experiences.map((exp) => ({
      ...exp,
      totalViews: countMap[String(exp._id)] || 0
    }));

    res.status(200).json(enriched);
  } catch (error) {
    res.status(500).json({
      message: 'An unexpected error occurred',
      error: error.message
    });
  }
}


async function getExperienceById(req, res) {
  try {
    const experience = await Experience.findById(req.params.id);

    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    res.status(200).json({ success: true, data: experience });
  } catch (error) {
    res.status(500).json({
      message: 'An unexpected error occurred',
      error: error.message
    });
  }
}

async function getUserExperienceVisit(req, res) {
  try {
    const { userId, experienceId } = req.body;

    if (!userId || !experienceId) {
      return res.status(400).json({ message: "userId and experienceId are required" });
    }
    const userMuseumAccess = await UserMuseumAccess.findOne({
      user: userId,
      'visitedExperiences.experienceId': experienceId
    }).populate('user museum');

    // Get the experience details first
    const experience = await Experience.findById(experienceId);

    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    if (!userMuseumAccess) {
      return res.status(200).json({ 
        message: 'User has not visited this experience',
        visited: false,
        experience: experience
      });
    }
    const visitDetails = userMuseumAccess.visitedExperiences.find(
      visit => visit.experienceId.toString() === experienceId
    );

    res.status(200).json({ 
      success: true, 
      visited: true,
      visitDetails: {
        visitedAt: visitDetails.visitedAt,
        experience: experience,
        userMuseumAccess: {
          purchased: userMuseumAccess.purchased,
          museum: userMuseumAccess.museum
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'An unexpected error occurred',
      error: error.message
    });
  }
}

async function updateExperience(req, res) {
  try {
    const { idMuseum, name, description, Access_code, points } = req.body;
    const artifactImageFile = req.file;
    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }
    experience.idMuseum = idMuseum || experience.idMuseum;
    experience.name = name || experience.name;
    experience.description = description || experience.description;
    experience.Access_code = Access_code || experience.Access_code;
    if (typeof points !== 'undefined') {
      experience.points = Number(points);
    }
    if (artifactImageFile) {
      const ext = path.extname(artifactImageFile.filename);
      const newFileName = `${path.basename(artifactImageFile.filename, ext)}-${experience._id}${ext}`;
      const oldPath = path.join(__dirname, '../public/uploads', artifactImageFile.filename);
      const newPath = path.join(__dirname, '../public/uploads', newFileName);
      fs.renameSync(oldPath, newPath);
      experience.ArtifactImage = newFileName;
    }
    await experience.save();
    res.status(200).json({
      message: 'Experience updated successfully',
      data: experience
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'An unexpected error occurred',
      error: error.message
    });
  }
}

async function deleteExperience(req, res) {
  try {
    const deleted = await Experience.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    res.status(200).json({ message: 'Experience deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'An unexpected error occurred',
      error: error.message
    });
  }
}

module.exports = {
  addExperience,
  getAllExperiences,
  getExperienceById,
  getUserExperienceVisit,
  updateExperience,
  deleteExperience
};
