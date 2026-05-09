const express = require('express');
const Task = require('../models/Task');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

// Get tasks (filtered by user if not admin, or by projectId)
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.projectId) {
      filter.projectId = req.query.projectId;
    }
    // Normal user sees their tasks, admin sees all (or filters by user)
    if (req.user.role === 'NORMAL') {
      filter.assigneeId = req.user._id;
    }

    const tasks = await Task.find(filter)
      .populate('projectId', 'name')
      .populate('assigneeId', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create task (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { title, description, category, projectId, assigneeId, dueDate } = req.body;
    const task = new Task({
      title,
      description,
      category,
      projectId,
      assigneeId,
      dueDate
    });
    const createdTask = await task.save();
    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update task
router.put('/:id', protect, async (req, res) => {
  try {
    const { status, title, description, category, assigneeId, dueDate } = req.body;
    const task = await Task.findById(req.params.id);

    if (task) {
      // Normal user can only update status if assigned
      if (req.user.role === 'NORMAL' && task.assigneeId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }

      // Admin can update anything, Normal can only update status
      if (req.user.role === 'ADMIN') {
        task.title = title || task.title;
        task.description = description || task.description;
        task.category = category || task.category;
        task.assigneeId = assigneeId || task.assigneeId;
        task.dueDate = dueDate || task.dueDate;
      }
      task.status = status || task.status;

      const updatedTask = await task.save();
      res.json(updatedTask);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
