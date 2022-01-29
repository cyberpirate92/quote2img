const fs = require('fs');
const { registerFont, createCanvas, Canvas } = require('canvas');

const CANVAS_WIDTH_PX = 1080;
const CANVAS_HEIGHT_PX = 1080;
const CANVAS_BORDER_WIDTH_PX = 10;
const CANVAS_PADDING_PX = 30;

const FONT_SIZE_PX = 50;
const MAX_TEXT_LENGTH = 300;
const TEXT_LINE_HEIGHT_PX = 20;
const FONT_FAMILY = 'JosefinSans';
const FONT_STYLE = `${FONT_SIZE_PX}px ${FONT_FAMILY}`;

const TEXT_COLOR = '#333';
const BORDER_COLOR = '#333';
const BACKGROUND_COLOR = '#E5E4E2';

loadCustomFonts();

const canvas = createCanvas(CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX);
const ctx = canvas.getContext('2d');

ctx.fillStyle = BORDER_COLOR;
ctx.fillRect(0, 0, CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX);
ctx.font = FONT_STYLE;  // Important that this line should be before the call to `breakIntoLines`

ctx.fillStyle = BACKGROUND_COLOR;
ctx.fillRect(CANVAS_BORDER_WIDTH_PX, CANVAS_BORDER_WIDTH_PX, CANVAS_WIDTH_PX - (2 *CANVAS_BORDER_WIDTH_PX), CANVAS_HEIGHT_PX - (2 *CANVAS_BORDER_WIDTH_PX));

let textToDisplay = `When people fall in love with someone's flowers, but not their roots, they don't know what to do when autumn comes. Your relationships need to be built on deep alignment on values, character, and morals (the roots) not just "love" appearance, hobbies & status (the flowers)`;
// let textToDisplay = `When people fall in love with someone's flowers, but not their roots, they don't know what to do when autumn comes. Your relationships need to be built on deep alignment on values, character, and morals (the roots) not just "love" appearance`;
// let textToDisplay = `What the fuck.`;
textToDisplay = normalizeText(textToDisplay);

if (MAX_TEXT_LENGTH < textToDisplay) {
    // TODO: Count emojis as single characters
    console.error("Error: Text exceeds 300 character limit");
    return;
}

const lines = breakIntoLines(ctx, textToDisplay, CANVAS_PADDING_PX);
renderLinesCenteredHorizontallyAndVertically(ctx, lines, CANVAS_PADDING_PX);
saveCanvasAsPng(canvas, './out/image.png');

/**
 * Replace consecutive spaces with a single space 
 * and trim string
 * @param {string} text 
 * @returns {string}
 */
function normalizeText(text) {
    return text.replace(/\s+/g, ' ').trim();
}

function loadCustomFonts() {
    registerFont('./fonts/JosefinSans-Regular.ttf', {
        family: FONT_FAMILY,
        style: 'regular',
    });
}

/**
 * Split text into multiple lines based on the cacnvas width
 * @param {CanvasRenderingContext2D} ctx 
 * @param {string} text 
 * @param {number} paddingInPx
 * @returns {Array<string>}
 */
function breakIntoLines(ctx, text, paddingInPx) {
    let lines = [];
    let words = text.split(' ');
    let currentLine = '';
    let canvasWidthInPx = ctx.canvas.width;
    let adjustedWidth = canvasWidthInPx - (2 * paddingInPx);

    console.log('Making alignment calculations');
    while (words.length > 0) {
        const word = words.shift();
        const updatedLine = currentLine + ' ' + word;
        const metrics = ctx.measureText(updatedLine);
        const estLineWidth = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;

        if (estLineWidth > adjustedWidth) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = updatedLine;
        }
    }

    if (currentLine.length > 0) {
        lines.push(currentLine);
    }
    console.log(`Text split into ${lines.length} lines`);
    return lines;
}

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {string[]} lines 
 * @param {number} paddingInPx 
 */
function renderLinesCenteredHorizontallyAndVertically(ctx, lines, paddingInPx) {
    const xCenter  = ctx.canvas.width / 2;
    const yCenter = ctx.canvas.height / 2;
    const maxLineHeight = getMaxLineHeight(ctx, lines);
    let oddNumberOfLines = lines.length % 2 !== 0;

    console.log('Rendering Lines');
    ctx.textAlign = 'center';
    ctx.fillStyle = TEXT_COLOR;
    ctx.strokeStyle = TEXT_COLOR;

    if (oddNumberOfLines) {
        const middleLineText = lines[parseInt(lines.length/2)];
        ctx.fillText(middleLineText, xCenter, yCenter);
    }

    if (lines.length > 1) {
        let middleLineIndex = parseInt(lines.length/2);
        let prevLineIdx = middleLineIndex - 1;
        let nextLineIdx = oddNumberOfLines ? middleLineIndex + 1 : middleLineIndex;
        
        // calculate height offset
        let yOffset = TEXT_LINE_HEIGHT_PX + maxLineHeight;

        while (prevLineIdx >= 0) {
            const yPos = yCenter - (yOffset * (middleLineIndex - prevLineIdx));
            ctx.fillText(lines[prevLineIdx], xCenter, yPos);
            prevLineIdx--;
        }
        while (nextLineIdx < lines.length) {
            const yPos = yCenter + (yOffset * (nextLineIdx - middleLineIndex));
            ctx.fillText(lines[nextLineIdx], xCenter, yPos);
            nextLineIdx++;
        }
    }
}

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {string[]} lines 
 */
function getMaxLineHeight(ctx, lines) {
    let maxHeight = 0;
    lines.forEach(line => {
        const metrics = ctx.measureText(line);
        const estLineHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        maxHeight = Math.max(maxHeight, estLineHeight);
    });
    return maxHeight;
}

/**
 * @param {Canvas} ctx 
 * @param {string} outputFilePath 
 */
function saveCanvasAsPng(canvas, outputFilePath) {
    console.log('Saving image');
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputFilePath, buffer);
    console.log('Image saved');
}