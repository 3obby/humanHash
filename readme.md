# Unique Image Generator

This project is a Node.js application that generates unique, visually interesting images based on user input. It uses cryptographic hashing and various mathematical functions to create complex, deterministic patterns.

## Example Output

Here's an example of an image generated using the input "sigmoid":

![Example Output](./public/outputLarge.png)

## Features

- Generates a unique 64x64 pixel image based on any text input
- Creates larger 512x512 pixel versions of the same image
- Utilizes SHA-256 hashing to ensure consistency and uniqueness
- Implements rotated sigmoids and distorted circles for visual complexity
- Outputs both small (output.png) and large (outputLarge.png) versions of the generated image

## How It Works

1. The user provides a text input.
2. The input is hashed using SHA-256.
3. The hash is used to generate an initial RGB grid.
4. Rotated sigmoids are drawn on the grid, with parameters determined by the hash.
5. Distorted circles are added to the grid, again using hash-derived parameters.
6. The resulting grid is written to two image files: a 64x64 pixel version and a 512x512 pixel version.

## Dependencies

- Node.js
- crypto (built-in Node.js module)
- Jimp (for image processing)

## Usage

1. Clone the repository
2. Install dependencies with `npm install`
3. Run the script with `node index.js`
4. Enter your desired input when prompted
5. The script will generate and save two image files: `output.png` and `outputLarge.png`

## Functions

- `dataToRGBGrid`: Converts input data to an RGB grid
- `drawRotatedSigmoids`: Adds sigmoid curves to the grid
- `drawDistortedCircles`: Adds distorted circles to the grid
- `writeGridToImage`: Writes the grid to a 64x64 pixel image file
- `writeGridToLargeImage`: Writes the grid to a 512x512 pixel image file
- `processInput`: Main function that orchestrates the image generation process

## Future Improvements

- Add more shape types and patterns
- Implement color schemes or palettes
- Allow for custom output sizes
- Create a web interface for easier use

Feel free to contribute to this project by submitting pull requests or opening issues for bugs and feature requests.
