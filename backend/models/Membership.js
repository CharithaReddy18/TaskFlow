const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  role: { type: String, enum: ['ADMIN', 'MEMBER'], default: 'MEMBER' }
}, { timestamps: true });

// Ensure unique combination of user and project
membershipSchema.index({ user: 1, project: 1 }, { unique: true });

module.exports = mongoose.model('Membership', membershipSchema);
