const Note = require('../models/Note');
const { generateAIContent } = require('../services/aiService');
const { extractTextFromPDF, isValidPDF } = require('../services/pdfService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, `pdf-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: function(req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

/**
 * @desc    Create new note with AI processing
 * @route   POST /api/notes
 * @access  Private
 */
exports.createNote = async (req, res) => {
  try {
    const { title, text } = req.body;
    let originalText = text;
    let noteTitle = title;

    // Handle file upload
    if (req.file) {
      // Validate PDF
      if (!isValidPDF(req.file)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid PDF file. Max size: 10MB'
        });
      }

      // Extract text from PDF
      originalText = await extractTextFromPDF(req.file.path);
      
      // Use filename as title if no title provided
      if (!noteTitle) {
        noteTitle = path.basename(req.file.originalname, '.pdf');
      }
    }

    // Validate input
    if (!originalText || originalText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide note content'
      });
    }

    if (!noteTitle) {
      noteTitle = 'Untitled Note';
    }

    // Limit text length for AI processing
    const maxTextLength = 10000;
    const truncatedText = originalText.length > maxTextLength 
      ? originalText.substring(0, maxTextLength) + '...'
      : originalText;

    // Generate AI content
    const aiContent = await generateAIContent(truncatedText);

    // Create note
    const note = await Note.create({
      user: req.user.id,
      title: noteTitle,
      originalText,
      summary: aiContent.summary,
      keyPoints: aiContent.keyPoints,
      flashcards: aiContent.flashcards,
      mcqs: aiContent.mcqs
    });

    res.status(201).json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Create Note Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error creating note'
    });
  }
};

/**
 * @desc    Get all notes for user
 * @route   GET /api/notes
 * @access  Private
 */
exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (error) {
    console.error('Get Notes Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching notes'
    });
  }
};

/**
 * @desc    Get single note
 * @route   GET /api/notes/:id
 * @access  Private
 */
exports.getNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    // Check if note belongs to user
    if (note.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this note'
      });
    }

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Get Note Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching note'
    });
  }
};

/**
 * @desc    Delete note
 * @route   DELETE /api/notes/:id
 * @access  Private
 */
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    // Check if note belongs to user
    if (note.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this note'
      });
    }

    await note.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete Note Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting note'
    });
  }
};

/**
 * @desc    Regenerate AI content for note
 * @route   POST /api/notes/:id/regenerate
 * @access  Private
 */
exports.regenerateAI = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    // Check if note belongs to user
    if (note.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify this note'
      });
    }

    // Limit text length
    const maxTextLength = 10000;
    const truncatedText = note.originalText.length > maxTextLength 
      ? note.originalText.substring(0, maxTextLength) + '...'
      : note.originalText;

    // Regenerate AI content
    const aiContent = await generateAIContent(truncatedText);

    // Update note
    note.summary = aiContent.summary;
    note.keyPoints = aiContent.keyPoints;
    note.flashcards = aiContent.flashcards;
    note.mcqs = aiContent.mcqs;
    note.updatedAt = Date.now();

    await note.save();

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Regenerate AI Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error regenerating AI content'
    });
  }
};

// Export multer middleware
exports.upload = upload;
