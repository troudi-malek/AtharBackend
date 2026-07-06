const Experience = require("../Models/experience");
const UserMuseumAccess = require("../Models/userMuseumAccess");

async function GetAccessedMuseumList(req, res) {
  try {
    const { user, museum } = req.body;

    if (!user || !museum) {
      return res.status(400).json({ message: "User and museum IDs are required" });
    }
    const allExperiences = await Experience.find({ idMuseum: museum });
    const accessRecord = await UserMuseumAccess.findOne({ userId: user, museumId: museum });

    let visitedExperienceIds = [];
    if (accessRecord?.visitedExperiences?.length) {
      visitedExperienceIds = accessRecord.visitedExperiences.map(entry =>
        entry.experienceId.toString()
      );
    }

    const experienceList = allExperiences.map(exp => ({
      _id: exp._id,
      name: exp.name,
      paid: exp.type,
      visited: visitedExperienceIds.includes(exp._id.toString())
    }));

    res.status(200).json(experienceList);
    
  } catch (error) {
    res.status(500).json({
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
}

async function GetLatestVisitedExperience(req, res) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const userAccesses = await UserMuseumAccess.find({ user: userId }).populate({
      path: 'visitedExperiences.experienceId',
      model: Experience,
      select: 'name',
    });

    let allVisitedExperiences = [];
    userAccesses.forEach(access => {
      if (access.visitedExperiences && access.visitedExperiences.length > 0) {
        allVisitedExperiences = allVisitedExperiences.concat(access.visitedExperiences);
      }
    });

    allVisitedExperiences.sort((a, b) => b.visitedAt - a.visitedAt);
    const experienceNames = allVisitedExperiences
      .filter(item => item.experienceId && item.experienceId.name)
      .map(item => item.experienceId.name);

    return res.status(200).json({ experienceNames });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
}

async function AddVisitedExperience(req, res) {
  try {
    const { user, museum, experienceId } = req.body;
    console.log(req.body);

    if (!user || !museum || !experienceId) {
      return res.status(400).json({ message: "user, museum and experienceId are required" });
    }

    const experience = await Experience.findById(experienceId);
    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    if (experience.idMuseum.toString() !== museum.toString()) {
      return res.status(400).json({ message: "Experience does not belong to the specified museum" });
    }

    let accessRecord = await UserMuseumAccess.findOne({ user, museum });

    if (!accessRecord) {
      accessRecord = new UserMuseumAccess({
        user,
        museum,
        visitedExperiences: [{ experienceId, visitedAt: new Date() }]
      });
      await accessRecord.save();
      return res.status(201).json({ message: "Visited experience recorded", access: accessRecord });
    }

    const existingIndex = accessRecord.visitedExperiences.findIndex(e => e.experienceId.toString() === experienceId.toString());
    if (existingIndex !== -1) {
      accessRecord.visitedExperiences[existingIndex].visitedAt = new Date();
      await accessRecord.save();
      return res.status(200).json({ message: "Visited experience already recorded; timestamp updated", access: accessRecord });
    }

    accessRecord.visitedExperiences.push({ experienceId, visitedAt: new Date() });
    await accessRecord.save();
    return res.status(200).json({ message: "Visited experience recorded", access: accessRecord });

  } catch (error) {
    return res.status(500).json({
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
}

module.exports= {
    GetAccessedMuseumList,
    GetLatestVisitedExperience,
    AddVisitedExperience
}