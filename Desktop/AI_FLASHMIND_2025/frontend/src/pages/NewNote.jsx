import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiUpload, FiFile, FiSend, FiFileText } from 'react-icons/fi';
import Loading from '../components/Loading';
import './NewNote.css';

const NewNote = () => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('text'); // 'text' or 'pdf'
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setPdfFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'text' && !text.trim()) {
      return setError('Please enter some text');
    }

    if (mode === 'pdf' && !pdfFile) {
      return setError('Please select a PDF file');
    }

    setLoading(true);

    try {
      let response;

      if (mode === 'pdf') {
        const formData = new FormData();
        formData.append('pdf', pdfFile);
        if (title) formData.append('title', title);
        
        response = await api.post('/notes', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await api.post('/notes', { title, text });
      }

      navigate(`/notes/${response.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create note');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="AI is processing your notes..." />;
  }

  return (
    <div className="new-note fade-in">
      <div className="new-note-header">
        <h1>Create New Note</h1>
        <p>Upload your study notes and let AI generate summaries, flashcards, and quizzes</p>
      </div>

      <div className="mode-toggle">
        <button
          className={`mode-btn ${mode === 'text' ? 'active' : ''}`}
          onClick={() => { setMode('text'); setPdfFile(null); }}
        >
          <FiFileText size={20} />
          Paste Text
        </button>
        <button
          className={`mode-btn ${mode === 'pdf' ? 'active' : ''}`}
          onClick={() => { setMode('pdf'); setText(''); }}
        >
          <FiUpload size={20} />
          Upload PDF
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="note-form">
        <div className="form-group">
          <label className="form-label">Title (optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="Enter a title for your note"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {mode === 'text' ? (
          <div className="form-group">
            <label className="form-label">Paste your notes</label>
            <textarea
              className="form-input form-textarea note-textarea"
              placeholder="Paste your study notes here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={15}
            />
            <p className="input-hint">
              Tip: Paste at least a few paragraphs for best results
            </p>
          </div>
        ) : (
          <div className="form-group">
            <label className="form-label">Upload PDF</label>
            <div
              className={`file-drop-zone ${pdfFile ? 'has-file' : ''}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              {pdfFile ? (
                <div className="selected-file">
                  <FiFile size={24} />
                  <span>{pdfFile.name}</span>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPdfFile(null);
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="drop-content">
                  <FiUpload size={32} />
                  <p>Click to select a PDF file</p>
                  <span>Maximum file size: 10MB</span>
                </div>
              )}
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
          <FiSend size={18} />
          {loading ? 'Processing...' : 'Generate with AI'}
        </button>
      </form>
    </div>
  );
};

export default NewNote;
