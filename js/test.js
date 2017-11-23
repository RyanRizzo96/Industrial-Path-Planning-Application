const fs = require('fs');
const jpeg = require('jpeg-js');
const PathFromImage = require('path-from-image');

const bluePointCoords = [62, 413];
const redPointCoords = [514, 39];

const image = jpeg.decode(fs.readFileSync('Images/map-start-end.jpg'), true);
const pathFromImage = new PathFromImage({
    width: image.width,
    height: image.height,
    imageData: image.data,
    colorPatterns: [{ r: [60, 255], g: [0, 70], b: [60, 255] }], // description of the mauve / ping color
});
const path = pathFromImage.path(bluePointCoords, redPointCoords); // 
console.log(path);