const fs = require('fs');
const jpeg = require('jpeg-js');
const PathFromImage = require('path-from-image');

const bluePointCoords = [0, -16];
const redPointCoords = [0, 0];

const image = jpeg.decode(fs.readFileSync('Images/PathPlanner.jpg'), true);
const pathFromImage = new PathFromImage({
    width: image.width,
    height: image.height,
    imageData: image.data,
    colorPatterns: [{ r: [128], g: [128], b: [128] }], // description of the mauve / ping color
});
const path = pathFromImage.path(bluePointCoords, redPointCoords); // 
console.log(path);