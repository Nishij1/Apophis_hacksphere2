export interface TTSOptions {
  language: 'en-US' | 'hi-IN';
  rate?: number;
  pitch?: number;
  volume?: number;
}

class TextToSpeech {
  private static instance: TextToSpeech;
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voicesLoaded: boolean = false;

  private constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadVoices();
    
    // Handle dynamic voice loading in Chrome
    if ('onvoiceschanged' in this.synthesis) {
      this.synthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  public static getInstance(): TextToSpeech {
    if (!TextToSpeech.instance) {
      TextToSpeech.instance = new TextToSpeech();
    }
    return TextToSpeech.instance;
  }

  private loadVoices(): void {
    this.voices = this.synthesis.getVoices();
    this.voicesLoaded = true;
  }

  private getVoiceForLanguage(language: string): SpeechSynthesisVoice | null {
    if (!this.voicesLoaded) {
      this.loadVoices();
    }

    // Try to find a voice that matches the language exactly
    let voice = this.voices.find(v => v.lang === language);
    
    // If no exact match, try to find a voice that starts with the language code
    if (!voice) {
      const langPrefix = language.split('-')[0];
      voice = this.voices.find(v => v.lang.startsWith(langPrefix));
    }

    // Fall back to the first available voice if no match found
    return voice || this.voices[0] || null;
  }

  public speak(text: string, options: TTSOptions): void {
    // Stop any current speech
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = this.getVoiceForLanguage(options.language);
    
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.lang = options.language;
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    this.currentUtterance = utterance;
    this.synthesis.speak(utterance);
  }

  public stop(): void {
    if (this.currentUtterance) {
      this.synthesis.cancel();
      this.currentUtterance = null;
    }
  }

  public pause(): void {
    this.synthesis.pause();
  }

  public resume(): void {
    this.synthesis.resume();
  }

  public isPlaying(): boolean {
    return this.synthesis.speaking;
  }

  public isPaused(): boolean {
    return this.synthesis.paused;
  }
}

export default TextToSpeech;