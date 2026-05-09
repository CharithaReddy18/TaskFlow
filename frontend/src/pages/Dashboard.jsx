import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { PieChart, ListChecks, Clock, CheckCircle, Activity } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/summary');
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '8px' }}>Dashboard</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Welcome back, {user.name}. Here's an overview of your tasks.</p>

      <div className="grid-3" style={{ marginBottom: '32px' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '16px', borderRadius: '12px', color: 'var(--primary)' }}>
            <ListChecks size={32} />
          </div>
          <div>
            <p className="form-label" style={{ marginBottom: '4px' }}>My Total Tasks</p>
            <h2 style={{ fontSize: '2rem' }}>{stats.myTasks.total}</h2>
          </div>
        </div>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: '12px', color: 'var(--success)' }}>
            <CheckCircle size={32} />
          </div>
          <div>
            <p className="form-label" style={{ marginBottom: '4px' }}>Completed</p>
            <h2 style={{ fontSize: '2rem' }}>{stats.myTasks.completed}</h2>
          </div>
        </div>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '16px', borderRadius: '12px', color: 'var(--warning)' }}>
            <Clock size={32} />
          </div>
          <div>
            <p className="form-label" style={{ marginBottom: '4px' }}>Pending</p>
            <h2 style={{ fontSize: '2rem' }}>{stats.myTasks.pending}</h2>
          </div>
        </div>
      </div>

      <div className="grid-3">
        <div className="glass-card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={20} /> All Project Tasks by Category
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(stats.allTasksByCategory).map(([category, count]) => {
              const totalAll = Object.values(stats.allTasksByCategory).reduce((a,b)=>a+b, 0);
              return (
              <div key={category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>{category}</span>
                  <span>{count}</span>
                </div>
                <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    background: category === 'Coding' ? 'var(--primary)' : category === 'UI Design' ? 'var(--warning)' : 'var(--success)', 
                    width: `${totalAll ? (count / totalAll) * 100 : 0}%` 
                  }}></div>
                </div>
              </div>
            )})}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
