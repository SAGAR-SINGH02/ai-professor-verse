// Extend the global Window interface to include Web Speech API types
declare global {
  interface Window {
    SpeechRecognition: typeof globalThis.SpeechRecognition;
    webkitSpeechRecognition: typeof globalThis.SpeechRecognition;
  }

  // This makes the file a module (required for global type declarations)
  export {};
}
