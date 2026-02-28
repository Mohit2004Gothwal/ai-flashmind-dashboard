const Loading = ({ text = 'Loading...' }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="spinner"></div>
        <p className="loading-text">{text}</p>
      </div>
    </div>
  );
};

export default Loading;
