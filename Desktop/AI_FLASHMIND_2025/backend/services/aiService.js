/**
 * Local AI content generation using text processing algorithms
 * No external API required - works offline
 * Returns: summary, keyPoints, flashcards, mcqs
 */
exports.generateAIContent = async (text) => {
  try {
    // Process the text and generate content locally
    const result = processTextLocally(text);
    return result;
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw new Error('Failed to generate AI content. Please try again.');
  }
};

/**
 * Local text processing to generate study content
 */
function processTextLocally(text) {
  // Generate summary by extracting key sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const summary = sentences.slice(0, 3).map(s => s.trim()).join('. ') + '.';
  
  // Extract key points (lines starting with numbers, bullets, or key phrases)
  const lines = text.split('\n');
  const keyPoints = [];
  
  // Extract lines that seem important
  const importantPatterns = [
    /^(\d+[\.\)])\s*/,  // 1. 2. etc
    /^[-*•]\s*/,         // bullet points
    /^(important|key|note|remember|main|essential|definition|concept)/i
  ];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 15 && trimmed.length < 200) {
      for (const pattern of importantPatterns) {
        if (pattern.test(trimmed)) {
          keyPoints.push(trimmed.replace(pattern, '').trim());
          break;
        }
      }
    }
  }
  
  // If we don't have enough key points, extract important sentences
  if (keyPoints.length < 3) {
    for (const sentence of sentences.slice(0, 10)) {
      const clean = sentence.trim();
      if (clean.length > 20 && !keyPoints.some(kp => kp.includes(clean.substring(0, 20)))) {
        keyPoints.push(clean);
        if (keyPoints.length >= 5) break;
      }
    }
  }
  
  // Generate flashcards from key concepts
  const flashcards = generateFlashcards(text, keyPoints);
  
  // Generate MCQs from the content
  const mcqs = generateMCQs(text, keyPoints);
  
  return {
    summary: summary || 'No summary available.',
    keyPoints: keyPoints.slice(0, 7),
    flashcards: flashcards,
    mcqs: mcqs
  };
}

/**
 * Generate flashcards from text
 */
function generateFlashcards(text, keyPoints) {
  const flashcards = [];
  const words = text.split(/\s+/);
  
  // Find potential term-definition pairs
  const termPatterns = [
    /([A-Z][a-z]+(?:\s+[A-Z]?[a-z]+)*)\s*[-:]\s*([^.]+)/g,
    /^(?:definition|meaning|means)\s+(?:of\s+)?(.+?)\s*[-:]\s*(.+)$/gim,
  ];
  
  for (const pattern of termPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null && flashcards.length < 5) {
      if (match[1].length > 2 && match[2].length > 5) {
        flashcards.push({
          question: `What is ${match[1]}?`,
          answer: match[2].trim()
        });
      }
    }
  }
  
  // If not enough, create from key points
  if (flashcards.length < 3) {
    for (let i = 0; i < keyPoints.length && flashcards.length < 5; i++) {
      const kp = keyPoints[i];
      const parts = kp.split(/[-:]/);
      if (parts.length >= 2) {
        flashcards.push({
          question: `What is ${parts[0].trim()}?`,
          answer: parts.slice(1).join(':').trim()
        });
      }
    }
  }
  
  return flashcards.slice(0, 5);
}

/**
 * Generate MCQs from text
 */
function generateMCQs(text, keyPoints) {
  const mcqs = [];
  
  // Common placeholder answers for generating MCQs
  const placeholders = [
    'The first option',
    'A related concept',
    'Another key point',
    'A different aspect'
  ];
  
  for (let i = 0; i < Math.min(5, keyPoints.length); i++) {
    const kp = keyPoints[i];
    if (kp.length > 30) {
      // Create a question from the key point
      const questionWords = kp.split(' ');
      let question = '';
      
      if (questionWords.length > 8) {
        question = `Which of the following is correct about "${questionWords.slice(0, 4).join(' ')}..."?`;
      } else {
        question = `What does "${kp.substring(0, 30)}..." refer to?`;
      }
      
      // Get other key points as wrong options
      const otherPoints = keyPoints.filter((_, idx) => idx !== i).slice(0, 3);
      const options = [
        kp,
        ...otherPoints,
        'None of the above'
      ].slice(0, 4);
      
      // Shuffle options
      const correctIndex = 0;
      
      mcqs.push({
        question: question,
        options: shuffleArray(options),
        correctAnswer: 0,
        explanation: kp
      });
    }
  }
  
  return mcqs.slice(0, 5);
}

/**
 * Shuffle array utility
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Regenerate AI content for existing note
 */
exports.regenerateAIContent = async (text) => {
  return await exports.generateAIContent(text);
};
