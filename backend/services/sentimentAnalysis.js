const axios = require('axios');

class SentimentAnalysisService {
  constructor() {
    this.apiKey = process.env.HUGGING_FACE_API_KEY || process.env.HUGGINGFACE_API_KEY;
    this.baseUrl = 'https://router.huggingface.co/hf-inference/models';
    this.model = process.env.HUGGING_FACE_MODEL || 'SamLowe/roberta-base-go_emotions';
  }

  async analyzeMoodBoard(moodBoard) {
    try {
      // Extract text content from mood board
      const textContent = this.extractTextFromMoodBoard(moodBoard);
      
      if (!textContent.trim()) {
        return {
          emotion: 'neutral',
          model: 'local-lexicon-v1',
          confidence: 0.5,
          details: {
            primary: 'neutral',
            secondary: [],
            intensity: 'medium',
            keywords: []
          }
        };
      }

      // Analyze with Hugging Face API
      const analysis = await this.analyzeWithHuggingFace(textContent);
      
      // Map emotions to our categories
      const mappedEmotion = this.mapEmotions(analysis);
      
      return {
        emotion: mappedEmotion.primary,
        model: analysis.model,
        confidence: mappedEmotion.confidence,
        details: {
          primary: mappedEmotion.primary,
          secondary: mappedEmotion.secondary,
          intensity: mappedEmotion.intensity,
          keywords: this.extractKeywords(textContent),
          rawAnalysis: analysis
        }
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return this.fallbackAnalysis(moodBoard);
    }
  }

  extractTextFromMoodBoard(moodBoard) {
    let textContent = '';
    
    // Add title and description
    if (moodBoard.title) textContent += moodBoard.title + ' ';
    if (moodBoard.description) textContent += moodBoard.description + ' ';
    
    // Add content from items
    if (moodBoard.items && Array.isArray(moodBoard.items)) {
      moodBoard.items.forEach(item => {
        if (item.type === 'text' && item.content) textContent += item.content + ' ';
        if (item.name) textContent += item.name + ' ';
        if (item.description) textContent += item.description + ' ';
        if (item.title) textContent += item.title + ' ';
      });
    }
    
    return textContent.trim().slice(0, 4000);
  }

  async analyzeWithHuggingFace(text) {
    if (!this.apiKey) {
      return this.fallbackTextAnalysis(text);
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.model}`,
        { inputs: text },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (response.data && Array.isArray(response.data)) {
        return { ...this.processHuggingFaceResponse(Array.isArray(response.data[0]) ? response.data[0] : response.data), model: this.model };
      }
      
      return this.fallbackTextAnalysis(text);
    } catch (error) {
      console.error('Hugging Face API error:', error.message);
      return this.fallbackTextAnalysis(text);
    }
  }

  processHuggingFaceResponse(data) {
    // Sort emotions by confidence
    const sortedEmotions = (Array.isArray(data) ? data : []).filter((entry) => typeof entry?.label === 'string' && Number.isFinite(entry.score) && entry.score >= 0 && entry.score <= 1).sort((a, b) => b.score - a.score);
    if (!sortedEmotions.length) throw new Error('Invalid emotion provider response');
    
    return {
      emotions: sortedEmotions.slice(0, 5), // Top 5 emotions
      primary: sortedEmotions[0],
      confidence: sortedEmotions[0].score
    };
  }

  mapEmotions(analysis) {
    const emotionMapping = {
      'happy': 'happy',
      'sad': 'sad',
      'angry': 'angry',
      // Happy emotions
      'joy': 'happy',
      'admiration': 'happy',
      'gratitude': 'happy',
      'love': 'happy',
      'amusement': 'happy',
      'excitement': 'happy',
      'pride': 'happy',
      'relief': 'happy',
      'optimism': 'happy',
      
      // Sad emotions
      'sadness': 'sad',
      'disappointment': 'sad',
      'remorse': 'sad',
      'embarrassment': 'sad',
      'grief': 'sad',
      
      // Angry emotions
      'anger': 'angry',
      'disapproval': 'angry',
      'annoyance': 'angry',
      'disgust': 'disgust',
      'contempt': 'angry',
      
      // Fear emotions
      'fear': 'fear',
      'nervousness': 'fear',
      'confusion': 'fear',
      
      // Surprise emotions
      'surprise': 'surprise',
      'realization': 'surprise',
      'curiosity': 'surprise',
      
      // Neutral emotions
      'neutral': 'neutral',
      'approval': 'neutral',
      'caring': 'neutral',
      'desire': 'neutral'
    };

    const primaryEmotion = analysis.primary?.label || 'neutral';
    const mappedPrimary = emotionMapping[primaryEmotion] || 'neutral';
    
    // Get secondary emotions
    const secondary = analysis.emotions?.slice(1, 3).map(e => ({
      emotion: emotionMapping[e.label] || 'neutral',
      confidence: e.score
    })) || [];

    // Calculate intensity based on confidence
    let intensity = 'medium';
    if (analysis.confidence > 0.8) intensity = 'high';
    else if (analysis.confidence < 0.4) intensity = 'low';

    return {
      primary: mappedPrimary,
      secondary: secondary.map(s => s.emotion),
      confidence: analysis.confidence,
      intensity: intensity
    };
  }

  extractKeywords(text) {
    // Simple keyword extraction (can be enhanced with NLP libraries)
    const words = text.toLowerCase().match(/[\p{L}]+/gu) || [];
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
    
    const keywords = words
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 10);
    
    return [...new Set(keywords)]; // Remove duplicates
  }

  fallbackTextAnalysis(text) {
    // Simple keyword-based analysis
    const happyWords = ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'love', 'good', 'nice', 'beautiful', 'fantastic', 'awesome'];
    const sadWords = ['sad', 'depressed', 'lonely', 'hurt', 'pain', 'cry', 'tears', 'miss', 'lost', 'alone', 'broken', 'heart'];
    const angryWords = ['angry', 'mad', 'furious', 'hate', 'rage', 'frustrated', 'annoyed', 'irritated', 'upset'];
    const disgustWords = ['disgusted', 'gross', 'nasty', 'repulsed', 'revolting', 'awful'];
    const fearWords = ['afraid', 'scared', 'fear', 'anxious', 'worried', 'nervous', 'terrified', 'panic', 'stress', 'concerned'];
    const surpriseWords = ['surprised', 'shocked', 'amazed', 'wow', 'incredible', 'unbelievable', 'astonished', 'stunned'];

    const words = text.toLowerCase().match(/[\p{L}]+/gu) || [];
    
    const scores = {
      happy: words.filter(w => happyWords.includes(w)).length,
      sad: words.filter(w => sadWords.includes(w)).length,
      angry: words.filter(w => angryWords.includes(w)).length,
      fear: words.filter(w => fearWords.includes(w)).length,
      surprise: words.filter(w => surpriseWords.includes(w)).length,
      disgust: words.filter(w => disgustWords.includes(w)).length
    };

    const maxEmotion = Object.values(scores).every((score) => score === 0) ? 'neutral' : Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    const confidence = maxEmotion === 'neutral' ? 0.5 : Math.min(0.95, 0.45 + scores[maxEmotion] * 0.12);

    return {
      model: 'local-lexicon-v1',
      emotions: [{ label: maxEmotion, score: confidence }],
      primary: { label: maxEmotion, score: confidence },
      confidence: confidence
    };
  }

  fallbackAnalysis(moodBoard) {
    const text = this.extractTextFromMoodBoard(moodBoard || '');
    const mapped = this.mapEmotions(this.fallbackTextAnalysis(text));
    return { emotion: mapped.primary, confidence: mapped.confidence, model: 'local-lexicon-v1', details: { primary: mapped.primary, secondary: mapped.secondary, intensity: mapped.intensity, keywords: this.extractKeywords(text), rawAnalysis: null } };
  }
  async analyzeText(text) {
    try {
      const analysis = await this.analyzeWithHuggingFace(text);
      const mappedEmotion = this.mapEmotions(analysis);
      
      return {
        emotion: mappedEmotion.primary,
        model: analysis.model,
        confidence: mappedEmotion.confidence,
        details: {
          primary: mappedEmotion.primary,
          secondary: mappedEmotion.secondary,
          intensity: mappedEmotion.intensity,
          keywords: this.extractKeywords(text)
        }
      };
    } catch (error) {
      console.error('Text analysis error:', error);
      return this.fallbackAnalysis({ description: text });
    }
  }
}

module.exports = new SentimentAnalysisService();
