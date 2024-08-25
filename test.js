import { processInput, gridToPPM } from './index.js';
import fs from 'fs/promises';
import path from 'path';
import { PNG } from 'pngjs';

async function testImageGeneration() {
  try {
    const input = "buybtc"; // Test input
    const grid = await processInput(input);
    console.log("Image generation successful");

    // Convert grid to PPM
    const ppmBuffer = gridToPPM(grid);

    // Save the PPM file
    const ppmPath = path.join(process.cwd(), 'output.ppm');
    await fs.writeFile(ppmPath, ppmBuffer);
    console.log(`PPM image saved to: ${ppmPath}`);

    // Convert PPM to PNG
    const pngBuffer = await convertPPMtoPNG(ppmBuffer);

    // Save the PNG file
    const pngPath = path.join(process.cwd(), 'output.png');
    await fs.writeFile(pngPath, pngBuffer);
    console.log(`PNG image saved to: ${pngPath}`);

  } catch (error) {
    console.error("Error generating or saving image:", error);
  }
}

async function convertPPMtoPNG(ppmBuffer) {
  return new Promise((resolve, reject) => {
    const ppmString = ppmBuffer.toString();
    const lines = ppmString.split('\n');
    const [width, height] = lines[1].split(' ').map(Number);
    const maxValue = parseInt(lines[2]);

    const png = new PNG({ width, height });

    let pixelIndex = 0;
    for (let i = 3; i < lines.length; i++) {
      const pixels = lines[i].trim().split(/\s+/).map(Number);
      for (let j = 0; j < pixels.length; j += 3) {
        png.data[pixelIndex++] = pixels[j];     // R
        png.data[pixelIndex++] = pixels[j + 1]; // G
        png.data[pixelIndex++] = pixels[j + 2]; // B
        png.data[pixelIndex++] = 255;           // A
      }
    }

    const pngBuffer = PNG.sync.write(png);
    resolve(pngBuffer);
  });
}

testImageGeneration();