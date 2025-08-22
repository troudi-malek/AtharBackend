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
      id: exp._id,
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

module.exports= {
    GetAccessedMuseumList,
    GetLatestVisitedExperience
}