# HumanHashImage

HumanHashImage is a unique, deterministic image generation tool that creates visually appealing and distinct images based on input text. It's designed to produce consistent outputs across multiple devices, making it ideal for validating data integrity in distributed systems.

## Features

- Generates a deterministic 64x64 pixel image from any text input
- Uses SHA-256 hashing for consistent and unique output across devices
- Incorporates rotated sigmoids and distorted circles for visual complexity
- Outputs both PPM and PNG formats
- Ensures reproducibility for data validation purposes

## Example

Here's an example of an image generated with the input "buybtc":

![HumanHashImage output for "buybtc"](output.png)

This image will be identical when generated on any device using the same input, allowing for visual confirmation of data consistency.

## How It Works

1. The input text is hashed using SHA-256, ensuring a consistent starting point across all devices.
2. The hash is used to generate a deterministic grid of RGB values.
3. Rotated sigmoids are drawn on the grid, with parameters derived from the hash.
4. Distorted circles are added, again using hash-derived parameters.
5. The resulting grid is converted to both PPM and PNG formats.

## Usage

To generate a deterministic image, use the `processInput` function from the `index.js` file:

