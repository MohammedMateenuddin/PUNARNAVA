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
    console.log('Neural Output:', predictions);

    // 1. Get the most confident prediction
    const topMatch = predictions[0];
    const topLabel = topMatch.className.toLowerCase();

    // 2. Scan our hardware database for a rawLabel match
    // We search through our devices to see if any of their rawLabels are contained in the AI output
    const exactMatch = devices.find(device => 
      device.rawLabels?.some(label => topLabel.includes(label))
    );

    if (exactMatch) {
      console.log(`Matched exact model: ${exactMatch.name}`);
      return { ...exactMatch, rawAIClass: topMatch.className };
    }

    // 3. Fallback to keyword search if no exact rawLabel match
    const keywordsStr = predictions.map(p => p.className.toLowerCase()).join(' ');
    
    if (keywordsStr.match(/mouse|joystick/i)) return { ...devices.find(d => d.id === 'mouse'), rawAIClass: 'Peripheral Input' };
    if (keywordsStr.match(/printer|copier/i)) return { ...devices.find(d => d.id === 'printer'), rawAIClass: 'Office Hardware' };
    if (keywordsStr.match(/camera|lens/i)) return { ...devices.find(d => d.id === 'camera'), rawAIClass: 'Optical Device' };
    if (keywordsStr.match(/headphone|speaker/i)) return { ...devices.find(d => d.id === 'headphones'), rawAIClass: 'Audio Output' };
    if (keywordsStr.match(/phone|cellular|hand-held/i)) return { ...devices.find(d => d.id === 'smartphone'), rawAIClass: 'Mobile Device' };
    if (keywordsStr.match(/laptop|notebook|computer/i)) return { ...devices.find(d => d.id === 'laptop'), rawAIClass: 'Computing Unit' };
    if (keywordsStr.match(/tablet|ipad/i)) return { ...devices.find(d => d.id === 'tablet'), rawAIClass: 'Tablet PC' };
    if (keywordsStr.match(/monitor|screen|display/i)) return { ...devices.find(d => d.id === 'monitor'), rawAIClass: 'Display Unit' };

    return null;
  } catch (error) {
    console.error('AI Intelligence Error:', error);
    return null;
  }
}
