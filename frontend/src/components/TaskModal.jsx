import React, { useState } from 'react';
import api from '../api';

const TaskModal = ({ projectId, users, onClose, onRefresh }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Coding');
  const [assigneeId, setAssigneeId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { 
        title, 
        description, 
        category, 
        projectId, 
        assigneeId: assigneeId || undefined 
      });
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card">
        <h2 style={{ marginBottom: '20px' }}>Add New Task</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input type="text" className="form-input" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" value={description} onChange={e => setDescription(e.target.value)} rows={2}></textarea>
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="Coding">Coding</option>
              <option value="UI Design">UI Design</option>
              <option value="User Research">User Research</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Assignee</label>
            <select className="form-select" value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
              <option value="">Unassigned</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Task</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
