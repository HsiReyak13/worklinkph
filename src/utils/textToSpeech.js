// Text-to-speech utility for reading important content

class TextToSpeechService {
  constructor() {
    this.synthesis = null;
    this.utterance = null;
    this.isEnabled = false;
    this.isSpeaking = false;
    this.currentText = null;

    // Check if browser supports speech synthesis
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.isEnabled = true;
    } else {
      console.warn('Speech synthesis not supported in this browser');
    }
  }

  /**
   * Speak text
   * @param {string} text - Text to speak
   * @param {object} options - Speech options
   */
  speak(text, options = {}) {
    if (!this.isEnabled || !this.synthesis) {
      console.warn('Text-to-speech is not available');
      return;
    }

    // Stop any current speech
    this.stop();

    if (!text || typeof text !== 'string') {
      return;
    }

    this.currentText = text;
    this.utterance = new SpeechSynthesisUtterance(text);

    // Set default options
    this.utterance.rate = options.rate || 1.0;
    this.utterance.pitch = options.pitch || 1.0;
    this.utterance.volume = options.volume || 1.0;
    this.utterance.lang = options.lang || 'en-US';

    // Event handlers
    this.utterance.onstart = () => {
      this.isSpeaking = true;
      if (options.onStart) options.onStart();
    };

    this.utterance.onend = () => {
      this.isSpeaking = false;
      this.currentText = null;
      if (options.onEnd) options.onEnd();
    };

    this.utterance.onerror = (event) => {
      this.isSpeaking = false;
      this.currentText = null;
      console.error('Speech synthesis error:', event);
      if (options.onError) options.onError(event);
    };

    // Speak
    this.synthesis.speak(this.utterance);
  }

  /**
   * Stop current speech
   */
  stop() {
    if (this.synthesis && this.isSpeaking) {
      this.synthesis.cancel();
      this.isSpeaking = false;
      this.currentText = null;
    }
  }

  /**
   * Pause current speech
   */
  pause() {
    if (this.synthesis && this.isSpeaking) {
      this.synthesis.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resume() {
    if (this.synthesis && this.isSpeaking) {
      this.synthesis.resume();
    }
  }

  /**
   * Check if currently speaking
   */
  getIsSpeaking() {
    return this.isSpeaking;
  }

  /**
   * Get available voices
   */
  getVoices() {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  /**
   * Speak important content (like notifications, errors, success messages)
   * @param {string} text - Text to speak
   * @param {string} type - Type of message (error, success, info, warning)
   */
  speakImportant(text, type = 'info') {
    if (!text) return;

    // Add context based on type
    let prefixedText = text;
    switch (type) {
      case 'error':
        prefixedText = `Error: ${text}`;
        break;
      case 'success':
        prefixedText = `Success: ${text}`;
        break;
      case 'warning':
        prefixedText = `Warning: ${text}`;
        break;
      default:
        prefixedText = text;
    }

    this.speak(prefixedText, {
      rate: 0.9, // Slightly slower for important content
      volume: 1.0,
    });
  }

  /**
   * Read page content (for screen readers)
   * @param {HTMLElement} element - Element to read
   */
  readElement(element) {
    if (!element) return;

    // Get text content, prioritizing aria-label, then text content
    let text = element.getAttribute('aria-label') || 
               element.textContent || 
               element.innerText;

    // Clean up text (remove extra whitespace)
    text = text.trim().replace(/\s+/g, ' ');

    if (text) {
      this.speak(text);
    }
  }
}

// Create singleton instance
const textToSpeechService = new TextToSpeechService();

// Load voices when available (some browsers load voices asynchronously)
if ('speechSynthesis' in window) {
  // Chrome loads voices asynchronously
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {
      // Voices loaded
    };
  }
}

export default textToSpeechService;

