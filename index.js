import crypto from 'crypto';
import Jimp from 'jimp';

function dataToRGBGrid(data, size = 64) {
  // Hash the input data
  let hash = crypto.createHash('sha256').update(data).digest('hex');
  
  // Convert hash to a binary string
  let binaryString = BigInt(`0x${hash}`).toString(2).padStart(256, '0');
  
  // If the binary string is not long enough, keep hashing and appending
  while (binaryString.length < size * size * 24) {  // Changed from 3 to 24 bits per pixel
    hash = crypto.createHash('sha256').update(hash).digest('hex');
    binaryString += BigInt(`0x${hash}`).toString(2).padStart(256, '0');
  }
  
  // Trim the binary string to the exact length needed
  binaryString = binaryString.slice(0, size * size * 24);
  
  // Create the RGB grid
  const grid = [];
  for (let i = 0; i < size; i++) {
    const row = [];
    for (let j = 0; j < size; j++) {
      const index = (i * size + j) * 24;
      const r = parseInt(binaryString.substr(index, 8), 2);
      const g = parseInt(binaryString.substr(index + 8, 8), 2);
      const b = parseInt(binaryString.substr(index + 16, 8), 2);
      row.push([r, g, b]);
    }
    grid.push(row);
  }
  
  return grid;
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function transformedSigmoid(x, a, b, c, d) {
  return a * sigmoid(b * x + c) + d;
}

function drawRotatedSigmoids(grid, hash) {
  const size = grid.length;
  let hashNum = BigInt(`0x${hash}`);
  
  // Determine number of sigmoids (1 to 8)
  const numSigmoids = Number((hashNum % 8n) + 1n);
  
  for (let s = 0; s < numSigmoids; s++) {
    // Convert BigInt to Number for parameters
    const a = Number(hashNum % 200n) - 100;
    const b = Number((hashNum >> 8n) % 10n) / 10 + 0.5;
    const c = Number((hashNum >> 16n) % 10n) - 5;
    const d = Number((hashNum >> 24n) % 100n) - 50;
    
    // Calculate rotation angle (0 to 2π)
    const rotationAngle = Number((hashNum >> 32n) % 360n) * (Math.PI / 180);
    
    // Generate sigmoid color based on hash
    const sigmoidR = Number((hashNum >> 40n) % 256n);
    const sigmoidG = Number((hashNum >> 48n) % 256n);
    const sigmoidB = Number((hashNum >> 56n) % 256n);
    
    // Generate sigmoid width based on hash (1 to 4 pixels)
    const sigmoidWidth = Number((hashNum >> 64n) % 4n) + 1;
    
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        // Translate coordinates to center
        const xc = x - size / 2;
        const yc = y - size / 2;
        
        // Rotate coordinates
        const xr = xc * Math.cos(rotationAngle) - yc * Math.sin(rotationAngle);
        const yr = xc * Math.sin(rotationAngle) + yc * Math.cos(rotationAngle);
        
        // Translate back and normalize
        const normalizedX = (xr + size / 2) / size * 10 - 5; // Map to range [-5, 5]
        
        const sigmoidY = transformedSigmoid(normalizedX, a, b, c, d);
        const normalizedY = (sigmoidY + 50) / 100;
        
        // Check if the point is on the sigmoid curve (with variable width tolerance)
        const tolerance = sigmoidWidth / (2 * size);
        if (Math.abs(normalizedY - (yr + size / 2) / size) < tolerance) {
          grid[y][x] = [sigmoidR, sigmoidG, sigmoidB]; // Use the generated color for the sigmoid
        }
      }
    }
    
    // Update hashNum for the next sigmoid
    hashNum = BigInt(`0x${crypto.createHash('sha256').update(hashNum.toString()).digest('hex')}`);
  }
  
  return grid;
}

function drawDistortedCircles(grid, hash) {
  const size = grid.length;
  let hashNum = BigInt(`0x${hash}`);
  
  // Determine number of circles (1 to 8)
  const numCircles = Number((hashNum % 8n) + 1n);
  
  for (let c = 0; c < numCircles; c++) {
    // Generate circle parameters
    const centerX = Number(hashNum % BigInt(size));
    const centerY = Number((hashNum >> 8n) % BigInt(size));
    const radius = Number((hashNum >> 16n) % (BigInt(size) / 4n)) + 5; // 5 to size/4 + 5
    const rotationAngle = Number((hashNum >> 24n) % 360n) * (Math.PI / 180);
    const distortionX = Number((hashNum >> 32n) % 5n) / 10 + 0.5; // 0.5 to 1.0
    const distortionY = Number((hashNum >> 40n) % 5n) / 10 + 0.5; // 0.5 to 1.0
    const width = Number((hashNum >> 48n) % 4n) + 1; // 1 to 4 pixels
    
    // Generate circle color
    const circleR = Number((hashNum >> 56n) % 256n);
    const circleG = Number((hashNum >> 64n) % 256n);
    const circleB = Number((hashNum >> 72n) % 256n);
    
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        // Translate and rotate
        const xc = x - centerX;
        const yc = y - centerY;
        const xr = xc * Math.cos(rotationAngle) - yc * Math.sin(rotationAngle);
        const yr = xc * Math.sin(rotationAngle) + yc * Math.cos(rotationAngle);
        
        // Apply distortion
        const distortedX = xr / distortionX;
        const distortedY = yr / distortionY;
        
        // Check if point is on the circle
        const distance = Math.sqrt(distortedX * distortedX + distortedY * distortedY);
        if (Math.abs(distance - radius) < width) {
          grid[y][x] = [circleR, circleG, circleB];
        }
      }
    }
    
    // Update hashNum for the next circle
    hashNum = BigInt(`0x${crypto.createHash('sha256').update(hashNum.toString()).digest('hex')}`);
  }
  
  return grid;
}

async function writeGridToImage(grid, filename) {
  const size = grid.length;
  const image = new Jimp(size, size);
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const [r, g, b] = grid[i][j];
      const color = Jimp.rgbaToInt(r, g, b, 255);
      image.setPixelColor(color, j, i);
    }
  }
  
  await image.writeAsync(filename);
}

async function writeGridToLargeImage(grid, filename) {
  const size = grid.length;
  const largeSize = size * 8;
  const image = new Jimp(largeSize, largeSize);
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const [r, g, b] = grid[i][j];
      const color = Jimp.rgbaToInt(r, g, b, 255);
      for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
          image.setPixelColor(color, j * 8 + x, i * 8 + y);
        }
      }
    }
  }
  
  await image.writeAsync(filename);
}

export async function processInput(input) {
  const hash = crypto.createHash('sha256').update(input).digest('hex');
  let grid = dataToRGBGrid(input);
  grid = drawRotatedSigmoids(grid, hash);
  grid = drawDistortedCircles(grid, hash);
  await writeGridToImage(grid, 'public/output.png');
  await writeGridToLargeImage(grid, 'public/outputLarge.png');
  return { small: '/output.png', large: '/outputLarge.png' };
}

// Next.js API route example
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { input } = req.body;
    const result = await processInput(input);
    res.status(200).json(result);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}