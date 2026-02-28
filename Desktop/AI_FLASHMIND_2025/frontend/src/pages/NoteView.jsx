import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  FiArrowLeft, 
  FiTrash2, 
  FiRefreshCw, 
  FiCopy,
  FiCheck,
  FiX,
  FiBook,
  FiList,
  FiHelpCircle
} from 'react-icons/fi';
import Loading from '../components/Loading';
import './NoteView.css';

const NoteView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  const [copied, setCopied] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  
  // MCQ interactive state
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchNote();
  }, [id]);

  const fetchNote = async () => {
    try {
      const response = await api.get(`/notes/${id}`);
      setNote(response.data.data);
      // Reset answers when note changes
      setSelectedAnswers({});
      setShowResults(false);
      setScore(0);
    } catch (error) {
      console.error('Error fetching note:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await api.delete(`/notes/${id}`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleRegenerate = async () => {
    if (!window.confirm('Regenerate AI content? This may take a moment.')) return;
    
    setRegenerating(true);
    try {
      const response = await api.post(`/notes/${id}/regenerate`);
      setNote(response.data.data);
      // Reset answers after regeneration
      setSelectedAnswers({});
      setShowResults(false);
      setScore(0);
    } catch (error) {
      console.error('Error regenerating:', error);
    } finally {
      setRegenerating(false);
    }
  };

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopied(section);
    setTimeout(() => setCopied(''), 2000);
  };

  // MCQ interaction handlers
  const handleOptionSelect = (mcqIndex, optionIndex) => {
    if (showResults) return; // Prevent changing after submission
    
    setSelectedAnswers(prev => ({
      ...prev,
      [mcqIndex]: optionIndex
    }));
  };

  const submitAnswers = () => {
    let correctCount = 0;
    note.mcqs?.forEach((mcq, index) => {
      if (selectedAnswers[index] === mcq.correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowResults(true);
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  if (loading) {
    return <Loading text="Loading note..." />;
  }

  if (!note) {
    return null;
  }

  const tabs = [
    { id: 'summary', label: 'Summary', icon: FiBook },
    { id: 'keypoints', label: 'Key Points', icon: FiList },
    { id: 'flashcards', label: 'Flashcards', icon: FiBook },
    { id: 'mcqs', label: 'MCQs', icon: FiHelpCircle }
  ];

  return (
    <div className="note-view fade-in">
      <div className="note-view-header">
        <div className="header-left">
          <Link to="/dashboard" className="back-link">
            <FiArrowLeft size={20} />
            Back to Notes
          </Link>
          <h1>{note.title}</h1>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary" 
            onClick={handleRegenerate}
            disabled={regenerating}
          >
            <FiRefreshCw className={regenerating ? 'spin' : ''} />
            {regenerating ? 'Regenerating...' : 'Regenerate'}
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            <FiTrash2 />
            Delete
          </button>
        </div>
      </div>

      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="content-section">
            <div className="section-header">
              <h2>Summary</h2>
              <button 
                className="btn-icon"
                onClick={() => copyToClipboard(note.summary, 'summary')}
              >
                {copied === 'summary' ? <FiCheck /> : <FiCopy />}
              </button>
            </div>
            <div className="summary-card">
              <p>{note.summary}</p>
            </div>
          </div>
        )}

        {/* Key Points Tab */}
        {activeTab === 'keypoints' && (
          <div className="content-section">
            <div className="section-header">
              <h2>Key Points</h2>
              <button 
                className="btn-icon"
                onClick={() => copyToClipboard(note.keyPoints.join('\n'), 'keypoints')}
              >
                {copied === 'keypoints' ? <FiCheck /> : <FiCopy />}
              </button>
            </div>
            <ul className="key-points-list">
              {note.keyPoints?.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Flashcards Tab */}
        {activeTab === 'flashcards' && (
          <div className="content-section">
            <div className="section-header">
              <h2>Flashcards</h2>
            </div>
            <div className="flashcards-grid">
              {note.flashcards?.map((card, index) => (
                <div key={index} className="flashcard">
                  <div className="flashcard-front">
                    <span className="flashcard-label">Q</span>
                    <p>{card.question}</p>
                  </div>
                  <div className="flashcard-back">
                    <span className="flashcard-label">A</span>
                    <p>{card.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MCQs Tab - Interactive */}
        {activeTab === 'mcqs' && (
          <div className="content-section">
            <div className="section-header">
              <h2>Multiple Choice Questions</h2>
              {!showResults ? (
                <button 
                  className="btn btn-primary"
                  onClick={submitAnswers}
                  disabled={Object.keys(selectedAnswers).length === 0}
                >
                  Submit Answers
                </button>
              ) : (
                <div className="score-display">
                  <span>Score: {score} / {note.mcqs?.length}</span>
                  <button className="btn btn-secondary" onClick={resetQuiz}>
                    Try Again
                  </button>
                </div>
              )}
            </div>
            
            {showResults && (
              <div className="quiz-results">
                {score >= note.mcqs?.length * 0.7 ? (
                  <div className="result-message success">
                    <FiCheck size={24} />
                    <span>Great job! You passed!</span>
                  </div>
                ) : (
                  <div className="result-message error">
                    <FiX size={24} />
                    <span>Keep practicing!</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="mcqs-list">
              {note.mcqs?.map((mcq, index) => (
                <div key={index} className="mcq-card">
                  <p className="mcq-question">
                    <span className="mcq-number">{index + 1}.</span> {mcq.question}
                  </p>
                  <div className="mcq-options">
                    {mcq.options?.map((option, optIndex) => {
                      const isSelected = selectedAnswers[index] === optIndex;
                      const isCorrect = optIndex === mcq.correctAnswer;
                      const showCorrect = showResults && isCorrect;
                      const showWrong = showResults && isSelected && !isCorrect;
                      
                      return (
                        <div 
                          key={optIndex} 
                          className={`mcq-option ${isSelected ? 'selected' : ''} ${showCorrect ? 'correct' : ''} ${showWrong ? 'wrong' : ''} ${showResults && !isSelected && isCorrect ? 'show-answer' : ''}`}
                          onClick={() => handleOptionSelect(index, optIndex)}
                        >
                          <span className="option-letter">
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          {option}
                          {showCorrect && <FiCheck className="option-icon correct-icon" />}
                          {showWrong && <FiX className="option-icon wrong-icon" />}
                        </div>
                      );
                    })}
                  </div>
                  {showResults && (
                    <div className="mcq-explanation">
                      <strong>Explanation:</strong> {mcq.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteView;
