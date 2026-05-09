const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');
const projectRoutes = require('../routes/projects');
const User = require('../models/User');
const Project = require('../models/Project');
const Membership = require('../models/Membership');

const app = express();
app.use(express.json());

// Mock Auth Middleware for testing
app.use((req, res, next) => {
  if (req.headers.user_id) {
    req.user = { _id: req.headers.user_id };
  }
  next();
});

// Since the real auth middleware fetches from DB and verifies JWT, 
// we override `protect`, `isProjectMember`, `isProjectAdmin` locally for this test or 
// use the real routes but pass valid mocked users.
// For simplicity in a real integration test, we use the real routes and seed users.
jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    next();
  },
  isProjectMember: async (req, res, next) => {
    const membership = await Membership.findOne({ user: req.user._id, project: req.params.id });
    if (!membership) return res.status(403).json({ message: 'Not authorized' });
    req.membership = membership;
    next();
  },
  isProjectAdmin: async (req, res, next) => {
    const membership = await Membership.findOne({ user: req.user._id, project: req.params.id });
    if (!membership || membership.role !== 'ADMIN') return res.status(403).json({ message: 'Not authorized' });
    req.membership = membership;
    next();
  }
}));

app.use('/api/projects', projectRoutes);

let mongoServer;
let adminId, memberId, nonMemberId, projectId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Seed data
  const admin = await User.create({ name: 'Admin', email: 'admin@test.com', password: 'pass' });
  const member = await User.create({ name: 'Member', email: 'member@test.com', password: 'pass' });
  const nonMember = await User.create({ name: 'NonMember', email: 'non@test.com', password: 'pass' });

  const project = await Project.create({ name: 'Test Project', ownerId: admin._id });

  await Membership.create({ user: admin._id, project: project._id, role: 'ADMIN' });
  await Membership.create({ user: member._id, project: project._id, role: 'MEMBER' });

  adminId = admin._id.toString();
  memberId = member._id.toString();
  nonMemberId = nonMember._id.toString();
  projectId = project._id.toString();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('RBAC on Projects', () => {
  
  it('Member cannot delete a project (returns 403)', async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('user_id', memberId);
    expect(res.status).toBe(403);
  });

  it('Member cannot add another member (returns 403)', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set('user_id', memberId)
      .send({ userId: nonMemberId, role: 'MEMBER' });
    expect(res.status).toBe(403);
  });

  it('Non-member receives 403 when trying to access project details', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('user_id', nonMemberId);
    // Since our isProjectMember returns 403, it verifies security.
    expect(res.status).toBe(403);
  });

  it('Admin can add another member', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set('user_id', adminId)
      .send({ userId: nonMemberId, role: 'MEMBER' });
    expect(res.status).toBe(201);
  });

});
