import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { devices } from '../data/mockData';

let model = null;
let isLoading = false;

// Preload the model
export async function loadAIModel() {
  if (model) return model;
  if (isLoading) return null; // Prevent multiple simultaneous loads
  
  try {
    isLoading = true;
    console.log('Loading MobileNet AI Model...');
    // Initialize tf backend
    await tf.ready();
    model = await mobilenet.load({ version: 2, alpha: 1.0 });
    console.log('MobileNet AI Model loaded successfully!');
    return model;
  } catch (error) {
    console.error('Failed to load AI model:', error);
    return null;
  } finally {
    isLoading = false;
  }
}

export async function detectDeviceFromImage(imageElement) {
  try {
    if (!model) await loadAIModel();
    if (!model) throw new Error('Model not loaded');

    // Run prediction
    const predictions = await model.classify(imageElement);
    console.log('AI Predictions:', predictions);

    // Combine top prediction classes
    const keywordsStr = predictions.map(p => p.className.toLowerCase()).join(' ');

    // If it's a screenshot of a website/app, MobileNet often predicts "web site" or "screen"
    if (keywordsStr.match(/web site|website|menu|comic book/i)) {
      console.log('Detected a screenshot/website, rejecting');
      return null;
    }

    // Match more specific peripherals first to avoid broad overlap (like "computer mouse" matching "computer")
    if (keywordsStr.match(/mouse|joystick/i)) {
      return devices.find(d => d.id === 'mouse');
    }
    if (keywordsStr.match(/printer|copier|photocopier/i)) {
      return devices.find(d => d.id === 'printer');
    }
    if (keywordsStr.match(/camera|lens|reflex/i)) {
      return devices.find(d => d.id === 'camera');
    }
    if (keywordsStr.match(/headphone|earphone|headset|speaker/i)) {
      return devices.find(d => d.id === 'headphones');
    }

    // General devices
    if (keywordsStr.match(/phone|cellular|ipod|dial/i)) {
      return devices.find(d => d.id === 'smartphone');
    }
    if (keywordsStr.match(/laptop|notebook|computer/i)) {
      return devices.find(d => d.id === 'laptop');
    }
    if (keywordsStr.match(/keyboard|typewriter/i)) {
      return devices.find(d => d.id === 'keyboard');
    }
    if (keywordsStr.match(/tablet|ipad/i)) {
      return devices.find(d => d.id === 'tablet');
    }
    if (keywordsStr.match(/monitor|television|display|desktop/i)) {
      return devices.find(d => d.id === 'monitor');
    }

    // Default to smartphone if no confident match
    console.log('No exact match, defaulting to random or smartphone');
    return null; // Let the caller decide the fallback
  } catch (error) {
    console.error('AI Detection Error:', error);
    return null;
  }
}
