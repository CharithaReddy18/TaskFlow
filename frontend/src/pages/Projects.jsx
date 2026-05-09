import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Plus, Users } from 'lucide-react';
import TaskModal from '../components/TaskModal';
import ProjectModal from '../components/ProjectModal';

const Projects = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [users, setUsers] = useState([]);

  const fetchData = async () => {
    try {
      const projRes = await api.get('/projects');
      setProjects(projRes.data);
      const taskRes = await api.get('/tasks');
      setTasks(taskRes.data);
      
      if (user.role === 'ADMIN') {
        const usersRes = await api.get('/auth/users');
        setUsers(usersRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusClass = (status) => {
    return status.replace(' ', '');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ marginBottom: '8px' }}>Projects & Tasks</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your work and team assignments.</p>
        </div>
        {user.role === 'ADMIN' && (
          <button className="btn btn-primary" onClick={() => setIsProjectModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      <div className="grid-3">
        {/* Project List */}
        <div className="glass-card" style={{ alignSelf: 'start' }}>
          <h3 style={{ marginBottom: '16px' }}>Projects</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {projects.map(p => (
              <div 
                key={p._id} 
                onClick={() => setSelectedProject(p._id)}
                style={{ 
                  padding: '16px', 
                  borderRadius: '8px', 
                  background: selectedProject === p._id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  border: selectedProject === p._id ? '1px solid var(--primary)' : '1px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <h4 style={{ marginBottom: '4px' }}>{p.name}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.description}</p>
              </div>
            ))}
            {projects.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No projects found.</p>}
          </div>
        </div>

        {/* Task List */}
        <div className="glass-card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3>Tasks {selectedProject && `- ${projects.find(p=>p._id===selectedProject)?.name}`}</h3>
            {user.role === 'ADMIN' && selectedProject && (
              <button className="btn btn-secondary" onClick={() => setIsTaskModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px' }}>
                <Plus size={16} /> Add Task
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {tasks
              .filter(t => selectedProject ? t.projectId?._id === selectedProject : true)
              .map(t => (
              <div key={t._id} style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '16px' }}>{t.title}</h4>
                    <span className={`badge ${getStatusClass(t.status)}`}>{t.status}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '12px' }}>{t.description}</p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span>Category: {t.category}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={14} /> {t.assigneeId?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>
                
                {/* Status Update Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <select 
                    className="form-select" 
                    value={t.status} 
                    onChange={(e) => handleUpdateTaskStatus(t._id, e.target.value)}
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    disabled={user.role === 'NORMAL' && t.assigneeId?._id !== user._id}
                  >
                    <option value="pending">Pending</option>
                    <option value="in progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            ))}
            {tasks.filter(t => selectedProject ? t.projectId?._id === selectedProject : true).length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                No tasks to display. Select a project or create a new task.
              </div>
            )}
          </div>
        </div>
      </div>

      {isProjectModalOpen && (
        <ProjectModal onClose={() => setIsProjectModalOpen(false)} onRefresh={fetchData} />
      )}
      {isTaskModalOpen && selectedProject && (
        <TaskModal 
          projectId={selectedProject} 
          users={users} 
          onClose={() => setIsTaskModalOpen(false)} 
          onRefresh={fetchData} 
        />
      )}
    </div>
  );
};

export default Projects;
