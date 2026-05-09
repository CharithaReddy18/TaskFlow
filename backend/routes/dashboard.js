const express = require('express');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/summary', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'NORMAL') {
      filter.assigneeId = req.user._id;
    }

    const tasks = await Task.find(filter);
    
    const summary = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      byCategory: {
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
