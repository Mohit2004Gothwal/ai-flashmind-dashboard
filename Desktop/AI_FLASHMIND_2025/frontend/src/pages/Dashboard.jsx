import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FiPlus, FiFileText, FiClock, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import Loading from '../components/Loading';
import './Dashboard.css';

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await api.get('/notes');
      setNotes(response.data.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    setDeleting(id);
    try {
      await api.delete(`/notes/${id}`);
      setNotes(notes.filter(note => note._id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      setDeleting(null);
    }
  };

  const handleRegenerate = async (id) => {
    if (!window.confirm('Regenerate AI content? This may take a moment.')) return;
    
    try {
      const response = await api.post(`/notes/${id}/regenerate`);
      setNotes(notes.map(note => 
        note._id === id ? response.data.data : note
      ));
    } catch (error) {
      console.error('Error regenerating:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <Loading text="Loading your notes..." />;
  }

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <div>
          <h1>My Notes</h1>
          <p>Manage your AI-generated study materials</p>
        </div>
        <Link to="/notes/new" className="btn btn-primary">
          <FiPlus size={20} />
          New Note
        </Link>
      </div>

      {notes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <FiFileText size={48} />
          </div>
          <h2>No notes yet</h2>
          <p>Create your first note to get started with AI-powered summaries</p>
          <Link to="/notes/new" className="btn btn-primary">
            <FiPlus size={20} />
            Create Your First Note
          </Link>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <div key={note._id} className="note-card">
              <div className="note-header">
                <h3>{note.title}</h3>
                <div className="note-actions">
                  <button 
                    className="btn-icon" 
                    onClick={() => handleRegenerate(note._id)}
                    title="Regenerate"
                  >
                    <FiRefreshCw />
                  </button>
                  <button 
                    className="btn-icon danger" 
                    onClick={() => handleDelete(note._id)}
                    disabled={deleting === note._id}
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              
              <p className="note-summary">
                {note.summary?.substring(0, 100)}...
              </p>
              
              <div className="note-meta">
                <span className="meta-item">
                  <FiFileText size={14} />
                  {note.keyPoints?.length || 0} key points
                </span>
                <span className="meta-item">
                  <FiClock size={14} />
                  {formatDate(note.createdAt)}
                </span>
              </div>
              
              <Link to={`/notes/${note._id}`} className="btn btn-secondary btn-sm">
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
