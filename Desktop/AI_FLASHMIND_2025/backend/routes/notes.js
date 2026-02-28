const express = require('express');
const router = express.Router();
const { 
  createNote, 
  getNotes, 
  getNote, 
  deleteNote, 
  regenerateAI,
  upload 
} = require('../controllers/noteController');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Routes
router.route('/')
  .get(getNotes)
  .post(upload.single('pdf'), createNote);

router.route('/:id')
  .get(getNote)
  .delete(deleteNote);

router.post('/:id/regenerate', regenerateAI);

module.exports = router;
