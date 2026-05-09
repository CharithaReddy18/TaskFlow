const express = require('express');
const Task = require('../models/Task');
const Membership = require('../models/Membership');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/summary', protect, async (req, res) => {
  try {
    // Find all projects user is a member of
    const memberships = await Membership.find({ user: req.user._id });
    const projectIds = memberships.map(m => m.project);

    // Get all tasks for these projects
    const tasks = await Task.find({ projectId: { $in: projectIds } });
    
    // Calculate overdue
    const today = new Date();
    const overdueCount = tasks.filter(t => t.dueDate && new Date(t.dueDate) < today && t.status !== 'completed').length;

    // Filter tasks assigned specifically to me
    const myTasks = tasks.filter(t => t.assigneeId?.toString() === req.user._id.toString());

    const summary = {
      activeProjects: projectIds.length,
      overdueTasks: overdueCount,
      myTasks: {
        total: myTasks.length,
        pending: myTasks.filter(t => t.status === 'pending').length,
        inProgress: myTasks.filter(t => t.status === 'in progress').length,
        completed: myTasks.filter(t => t.status === 'completed').length,
      },
      allTasksByCategory: {
        'User Research': tasks.filter(t => t.category === 'User Research').length,
        'UI Design': tasks.filter(t => t.category === 'UI Design').length,
        'Coding': tasks.filter(t => t.category === 'Coding').length,
      }
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
