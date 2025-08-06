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


module.exports= {
    GetAccessedMuseumList
}