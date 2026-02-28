const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

/**
 * Extract text from PDF file
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text
 */
exports.extractTextFromPDF = async (pdfPath) => {
  try {
    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      throw new Error('PDF file not found');
    }

    // Read PDF file
    const dataBuffer = fs.readFileSync(pdfPath);
    
    // Parse PDF
    const data = await pdf(dataBuffer);
    
    // Return extracted text
    const text = data.text;
    
    // Clean up - delete the uploaded file
    fs.unlinkSync(pdfPath);
    
    if (!text || text.trim().length === 0) {
      throw new Error('No text could be extracted from the PDF');
    }
    
    return text;
  } catch (error) {
    console.error('PDF Extraction Error:', error);
    throw new Error('Failed to extract text from PDF: ' + error.message);
  }
};

/**
 * Validate PDF file
 * @param {object} file - Multer file object
 * @returns {boolean}
 */
exports.isValidPDF = (file) => {
  // Check file type
  if (file.mimetype !== 'application/pdf') {
    return false;
  }
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return false;
  }
  
  return true;
};
