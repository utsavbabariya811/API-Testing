const express = require('express');
const OpenAI = require('openai');

const router = express.Router();

// Rate limiting: one request per task title per minute
const requestTimes = new Map();
const ONE_MINUTE = 60 * 1000;

// POST /api/ai/generate-description
router.post('/generate-description', async (req, res) => {
  const { title } = req.body || {};

  // Validate task title
  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid task title.'
    });
  }

  if (title.trim().length > 200) {
    return res.status(400).json({
      success: false,
      message: 'Task title must be 200 characters or fewer.'
    });
  }

  // Rate limiting
  const normalizedTitle = title.trim().toLowerCase();
  const now = Date.now();
  const lastRequest = requestTimes.get(normalizedTitle);

  if (lastRequest && now - lastRequest < ONE_MINUTE) {
    return res.status(429).json({
      success: false,
      message: 'Please wait one minute before generating another description.'
    });
  }

  requestTimes.set(normalizedTitle, now);

  try {
    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured.');
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Generate AI description
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Write concise, practical, actionable task descriptions using simple language.'
        },
        {
          role: 'user',
          content: `Generate a short task description for: ${title.trim()}`
        }
      ],
      max_tokens: 120
    });

    const description =
      completion.choices[0]?.message?.content?.trim();

    if (!description) {
      throw new Error('The AI returned an empty response.');
    }

    return res.status(200).json({
      success: true,
      description,
      fallback: false
    });

  } catch (error) {
    console.error('AI description generation failed:', error.message);

    return res.status(200).json({
      success: true,
      description:
        'AI suggestions are temporarily unavailable. Please write a description manually.',
      fallback: true
    });
  }
});

module.exports = router;