const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  originalText: {
    type: String,
    required: [true, 'Please provide note content']
  },
  summary: {
    type: String,
    default: ''
  },
  keyPoints: [{
    type: String
  }],
  flashcards: [{
    question: String,
    answer: String
  }],
  mcqs: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    explanation: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
noteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Note', noteSchema);
