const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Membership = require('../models/Membership');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const isProjectMember = async (req, res, next) => {
  const projectId = req.params.id || req.body.projectId || req.query.projectId;
  if (!projectId) return res.status(400).json({ message: 'Project ID required' });

  const membership = await Membership.findOne({ user: req.user._id, project: projectId });
  if (!membership) {
    return res.status(403).json({ message: 'Not authorized as a member of this project' });
  }
  req.membership = membership;
  next();
};

const isProjectAdmin = async (req, res, next) => {
  const projectId = req.params.id || req.body.projectId || req.query.projectId;
  if (!projectId) return res.status(400).json({ message: 'Project ID required' });

  const membership = await Membership.findOne({ user: req.user._id, project: projectId });
  if (!membership || membership.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Not authorized as an admin of this project' });
  }
  req.membership = membership;
  next();
};

module.exports = { protect, isProjectMember, isProjectAdmin };
