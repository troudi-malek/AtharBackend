const Experience = require('../Models/experience');
const path = require('path');
const fs = require('fs');

async function addExperience(req, res) {
  try {
    const { idMuseum, name, description, Access_code, type } = req.body;

    const experience = new Experience({
      idMuseum,
      name,
      description,
      Access_code,
      type
    });

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
    const experiences = await Experience.find().populate('idMuseum');
    res.status(200).json(experiences);
  } catch (error) {
    res.status(500).json({
      message: 'An unexpected error occurred',
      error: error.message
    });
  }
}

async function getExperienceById(req, res) {
  try {
    const experience = await Experience.findById(req.params.id).populate('idMuseum');

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

async function updateExperience(req, res) {
  try {
    const { idMuseum, name, description, Access_code, type } = req.body;

    const experience = await Experience.findById(req.params.id);

    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    experience.idMuseum = idMuseum || experience.idMuseum;
    experience.name = name || experience.name;
    experience.description = description || experience.description;
    experience.Access_code = Access_code || experience.Access_code;
    experience.type = type || experience.type;

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
  updateExperience,
  deleteExperience
};
