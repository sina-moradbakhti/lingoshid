# 🗣️ Speech Service Guide

**Child-Friendly Text-to-Speech Across the Entire Application**

---

## 📍 Location

**Service File:** `/webapp/src/app/services/speech.service.ts`

This centralized service provides consistent, child-friendly text-to-speech across all features in LingoShid.

---

## ⚙️ Current Settings (Optimized for Elementary School Children)

```typescript
SPEECH_RATE = 0.5   // Slower speed for children learning
SPEECH_PITCH = 1.6  // Higher pitch for softer, friendlier sound
SPEECH_VOLUME = 1.0 // Full volume
```

### Voice Selection Priority:
1. Child-friendly voices (Samantha, Karen, Zira)
2. US English female voices
3. Any US English non-male voices
4. Any English voice
5. Default system voice

---

## 🎯 How to Use in Any Component

### 1. Import the Service

```typescript
import { SpeechService } from '../../../services/speech.service';
```

### 2. Inject in Constructor

```typescript
constructor(private speechService: SpeechService) {}
```

### 3. Use the Service

#### Basic Usage - Just Speak

```typescript
this.speechService.speak('Hello');
```

#### With Callbacks

```typescript
this.speechService.speak(
  'Hello',
  () => {
    // Called when speech ends
    console.log('Speech finished');
  },
  () => {
    // Called on error
    console.error('Speech failed');
  }
);
```

#### With Promise

```typescript
async playWord() {
  try {
    await this.speechService.speak('Hello');
    console.log('Speech completed');
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### 4. Control Playback

```typescript
// Stop current speech
this.speechService.stop();

// Check if speaking
if (this.speechService.isSpeaking()) {
  console.log('Currently speaking');
}

// Get current settings
const settings = this.speechService.getSettings();
console.log('Rate:', settings.rate);
console.log('Pitch:', settings.pitch);
console.log('Voice:', settings.voice);
```

---

## 📋 Available Methods

### `speak(text: string, onEnd?, onError?): Promise<void>`
Speaks the provided text using child-friendly voice settings.

**Parameters:**
- `text` - The text to speak
- `onEnd` - Optional callback when speech completes
- `onError` - Optional callback on error

**Returns:** Promise that resolves when speech completes

### `stop(): void`
Stops any ongoing speech immediately.

### `isSpeaking(): boolean`
Returns `true` if currently speaking, `false` otherwise.

### `getSettings(): object`
Returns current speech settings (rate, pitch, volume, voice name).

---

## 🎨 Example: Vocabulary Module

```typescript
import { Component } from '@angular/core';
import { SpeechService } from '../../../services/speech.service';

@Component({
  selector: 'app-vocabulary-module',
  templateUrl: './vocabulary-module.component.html'
})
export class VocabularyModuleComponent {
  constructor(private speechService: SpeechService) {}

  playWord(word: string) {
    this.speechService.speak(word);
  }

  playDefinition(definition: string) {
    this.speechService.speak(definition);
  }
}
```

---

## 🎓 Example: Story Reading Module

```typescript
async readStory(sentences: string[]) {
  for (const sentence of sentences) {
    await this.speechService.speak(sentence);
    // Wait for each sentence to finish before next
  }
  console.log('Story reading complete!');
}
```

---

## 🔧 Changing Global Settings

To change voice settings for the **entire application**, edit:

**File:** `/webapp/src/app/services/speech.service.ts`

```typescript
// Child-friendly speech settings
private readonly SPEECH_RATE = 0.5;  // Change this (0.1-1.0)
private readonly SPEECH_PITCH = 1.6; // Change this (0.5-2.0)
private readonly SPEECH_VOLUME = 1.0; // Change this (0.0-1.0)
```

**Important:** Changes apply to ALL features using the service!

---

## 📱 Browser Support

- ✅ Chrome/Edge (best support)
- ✅ Safari (Mac/iOS - excellent with Samantha voice)
- ✅ Firefox (good support)
- ⚠️ Mobile browsers (limited voices)

---

## 🎯 Where It's Currently Used

1. **Pronunciation Module** - Word pronunciation playback
2. *(Future features will use the same service)*

---

## 💡 Best Practices

1. **Always provide user feedback** when speaking
   ```typescript
   isPlaying = true;
   await this.speechService.speak(text);
   isPlaying = false;
   ```

2. **Clean up on component destroy**
   ```typescript
   ngOnDestroy() {
     this.speechService.stop();
   }
   ```

3. **Handle errors gracefully**
   ```typescript
   this.speechService.speak(
     text,
     () => console.log('Success'),
     () => alert('Audio playback failed')
   );
   ```

---

## ✅ Benefits of Centralized Service

- 🎯 **Consistency** - Same voice across all features
- 🔧 **Easy Updates** - Change settings in one place
- 📊 **Better UX** - Optimized for children learning
- 🚀 **Reusable** - Use anywhere in the app
- 🧹 **Maintainable** - Single source of truth

---

## 🎉 Summary

The `SpeechService` provides child-friendly text-to-speech across LingoShid:

- **Rate:** 0.5 (slow and clear)
- **Pitch:** 1.6 (soft and friendly)
- **Voice:** Automatically selects best child-friendly voice
- **Usage:** Simple API works anywhere in the app

Just inject the service and call `.speak(text)` - that's it! 🎤

---

*Last updated: November 18, 2025*
*Current settings optimized for elementary school children*
