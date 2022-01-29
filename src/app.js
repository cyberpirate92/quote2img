const { renderQuote } = require('./utils/canvasHelper');

let authorName = "Lao Tzu";
let textToDisplay = `“If you are depressed you are living in the past, if you are anxious you are living in the future. If you are at peace, you are living in the present.”`;
// let textToDisplay = `When people fall in love with someone's flowers, but not their roots, they don't know what to do when autumn comes. Your relationships need to be built on deep alignment on values, character, and morals (the roots) not just "love" appearance`;
// let textToDisplay = `What the fuck.`;
renderQuote(textToDisplay, authorName, './out/image.png');