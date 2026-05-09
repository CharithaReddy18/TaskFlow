const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

// Get all projects
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find({}).populate('ownerId', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create project (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = new Project({
      name,
      description,
      ownerId: req.user._id
    });
    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get project by ID and its tasks
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('ownerId', 'name email');
    if (project) {
      const tasks = await Task.find({ projectId: project._id }).populate('assigneeId', 'name email');
      res.json({ project, tasks });
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
