const axios = require('axios');
const fs = require('fs');
const path = require('path');

class VoiceAssistantService {
  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
  }

  async generateSpeech(text, voiceId = '21m00Tcm4TlvDq8ikWAM', emotion = 'happy') {
    try {
      if (!this.apiKey) {
        console.warn('ElevenLabs API key not found, using fallback');
        return this.fallbackSpeech(text, emotion);
      }

      // Map emotions to voice settings
      const voiceSettings = this.getVoiceSettings(emotion);

      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${voiceId}`,
        {
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: voiceSettings
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );

      // Convert audio buffer to base64 for frontend
      const audioBuffer = Buffer.from(response.data);
      const base64Audio = audioBuffer.toString('base64');
      const dataUrl = `data:audio/mpeg;base64,${base64Audio}`;
      
      return dataUrl;
    } catch (error) {
      console.error('ElevenLabs API error:', error.message);
      return this.fallbackSpeech(text, emotion);
    }
  }

  getVoiceSettings(emotion) {
    const settings = {
      happy: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      },
      sad: {
        stability: 0.7,
        similarity_boost: 0.5,
        style: 0.3,
        use_speaker_boost: true
      },
      angry: {
        stability: 0.3,
        similarity_boost: 0.8,
        style: 0.7,
        use_speaker_boost: true
      },
      fear: {
        stability: 0.6,
        similarity_boost: 0.6,
        style: 0.4,
        use_speaker_boost: true
      },
      disgust: {
        stability: 0.4,
        similarity_boost: 0.7,
        style: 0.5,
        use_speaker_boost: true
      },
      surprise: {
        stability: 0.2,
        similarity_boost: 0.9,
        style: 0.8,
        use_speaker_boost: true
      }
    };

    return settings[emotion] || settings.happy;
  }

  // Fallback using Web Speech API (client-side)
  fallbackSpeech(text, emotion) {
    // Return a special marker that tells frontend to use Web Speech API
    return `WEB_SPEECH_API:${text}:${emotion}`;
  }

  async speakMoodBoard(moodBoard, emotion) {
    const text = `Your mood board titled "${moodBoard.title}" has been analyzed. 
                  The detected emotion is ${emotion}. 
                  ${moodBoard.description || 'No description provided.'}`;
    
    return await this.generateSpeech(text, '21m00Tcm4TlvDq8ikWAM', emotion);
  }

  async speakMoodHistory(moodHistory) {
    if (!moodHistory || moodHistory.length === 0) {
      return await this.generateSpeech("You haven't recorded any moods yet. Start by creating a mood board!");
    }

    const recentMoods = moodHistory.slice(0, 5);
    const moodCounts = {};
    
    recentMoods.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });

    const dominantMood = Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b
    );

    const text = `Your recent mood history shows you've been feeling ${dominantMood} most often. 
                  You've recorded ${moodHistory.length} mood entries in total.`;

    return await this.generateSpeech(text, '21m00Tcm4TlvDq8ikWAM', dominantMood);
  }
}

module.exports = new VoiceAssistantService(); 