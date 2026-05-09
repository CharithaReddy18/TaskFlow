const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Membership = require('../models/Membership');
const { protect, isProjectMember, isProjectAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all projects where user is a member
router.get('/', protect, async (req, res) => {
  try {
    const memberships = await Membership.find({ user: req.user._id }).populate({
      path: 'project',
      populate: { path: 'ownerId', select: 'name email' }
    });
    // Extract projects and inject the user's role in that project
    const projects = memberships.map(m => {
      if (!m.project) return null;
      const p = m.project.toObject();
      p.myRole = m.role;
      return p;
    }).filter(Boolean);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create project
router.post('/', protect, async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = new Project({
      name,
      description,
      ownerId: req.user._id
    });
    const createdProject = await project.save();

    // Automatically create ADMIN membership for the creator
    await Membership.create({
      user: req.user._id,
      project: createdProject._id,
      role: 'ADMIN'
    });

    res.status(201).json(createdProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get project by ID (must be member)
router.get('/:id', protect, isProjectMember, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('ownerId', 'name email');
    const tasks = await Task.find({ projectId: project._id }).populate('assigneeId', 'name email');
    const members = await Membership.find({ project: project._id }).populate('user', 'name email');
    
    res.json({ 
      project: { ...project.toObject(), myRole: req.membership.role }, 
      tasks, 
      members 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add member to project (Admin only)
router.post('/:id/members', protect, isProjectAdmin, async (req, res) => {
  try {
    const { userId, role } = req.body;
    const exists = await Membership.findOne({ user: userId, project: req.params.id });
    if (exists) return res.status(400).json({ message: 'User is already a member' });

    const member = await Membership.create({
      user: userId,
      project: req.params.id,
      role: role || 'MEMBER'
    });
    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove member from project (Admin only)
router.delete('/:id/members/:userId', protect, isProjectAdmin, async (req, res) => {
  try {
    await Membership.findOneAndDelete({ user: req.params.userId, project: req.params.id });
    res.json({ message: 'Member removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete project (Admin only)
router.delete('/:id', protect, isProjectAdmin, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    await Membership.deleteMany({ project: req.params.id });
    await Task.deleteMany({ projectId: req.params.id });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
