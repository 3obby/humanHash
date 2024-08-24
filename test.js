import { processInput } from './index.js';

async function testImageGeneration() {
  try {
    const input = "sigmoid"; // Test input
    const result = await processInput(input);
    console.log("Image generation successful:");
    console.log(result);
  } catch (error) {
    console.error("Error generating image:", error);
  }
}

testImageGeneration();