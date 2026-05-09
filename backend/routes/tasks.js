const express = require('express');
const Task = require('../models/Task');
const Membership = require('../models/Membership');
const { protect, isProjectAdmin, isProjectMember } = require('../middleware/auth');
const router = express.Router();

// Get tasks (filtered by projects the user is a member of)
router.get('/', protect, async (req, res) => {
  try {
    const memberships = await Membership.find({ user: req.user._id }).select('project');
    const projectIds = memberships.map(m => m.project);

    const filter = { projectId: { $in: projectIds } };
    if (req.query.projectId) {
      // Ensure the queried project is one the user is a member of
      if (!projectIds.some(id => id.toString() === req.query.projectId)) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      filter.projectId = req.query.projectId;
    }
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;

    const tasks = await Task.find(filter)
      .populate('projectId', 'name')
      .populate('assigneeId', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create task (Project Admin only)
// Requires `projectId` in body to trigger `isProjectAdmin`
router.post('/', protect, isProjectAdmin, async (req, res) => {
  try {
    const { title, description, category, projectId, assigneeId, dueDate, priority } = req.body;
    
    // Validate assignee is a member
    if (assigneeId) {
      const isMember = await Membership.findOne({ user: assigneeId, project: projectId });
      if (!isMember) return res.status(400).json({ message: 'Assignee must be a member of the project' });
    }

    const task = new Task({
      title, description, category, projectId, assigneeId, dueDate, priority
    });
    const createdTask = await task.save();
    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update task (Project Member or Admin)
// We need to fetch the task first to know which project it belongs to
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Check membership
    const membership = await Membership.findOne({ user: req.user._id, project: task.projectId });
    if (!membership) return res.status(403).json({ message: 'Not authorized' });

    const { status, title, description, category, assigneeId, dueDate, priority } = req.body;

    if (membership.role === 'ADMIN') {
      // Admin can update anything
      task.title = title || task.title;
      task.description = description || task.description;
      task.category = category || task.category;
      task.dueDate = dueDate || task.dueDate;
      task.priority = priority || task.priority;
      
      if (assigneeId && assigneeId !== task.assigneeId?.toString()) {
        const isAssigneeMember = await Membership.findOne({ user: assigneeId, project: task.projectId });
        if (!isAssigneeMember) return res.status(400).json({ message: 'Assignee must be a member' });
        task.assigneeId = assigneeId;
      }
    } else {
      // Member can only update status, and ONLY if they are the assignee
      if (task.assigneeId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Members can only update their own assigned tasks' });
      }
      // Cannot change other fields
    }

    task.status = status || task.status;
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete task (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const membership = await Membership.findOne({ user: req.user._id, project: task.projectId });
    if (!membership || membership.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only Project Admins can delete tasks' });
    }

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
