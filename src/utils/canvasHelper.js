const fs = require('fs');
const { registerFont, createCanvas } = require('canvas');

const CANVAS_WIDTH_PX = 1080;
const CANVAS_HEIGHT_PX = 1080;
const CANVAS_BORDER_WIDTH_PX = 10;
const CANVAS_PADDING_PX = 30;

const FONT_SIZE_PX = 50;
const MAX_TEXT_LENGTH = 300;
const TEXT_LINE_HEIGHT_PX = 20;
const FONT_FAMILY = 'JosefinSans';
const QUOTE_FONT_STYLE = `${FONT_SIZE_PX}px ${FONT_FAMILY}`;
const AUTHOR_FONT_STYLE = `italic ${parseInt(FONT_SIZE_PX * 0.85)}px ${FONT_FAMILY}`;

const BLACK = '#010101';
const WHITE = '#FEFEFE';

let TEXT_COLOR = WHITE;
let BORDER_COLOR = BLACK;
let BACKGROUND_COLOR = BLACK;

/**
 * @param {string} textToDisplay 
 * @param {string} author 
 * @param {string} outputFilePath 
 * @param {string} style Can be either 'light' or 'dark'
 */
function renderQuote (textToDisplay, author, outputFilePath, style) {
    textToDisplay = normalizeText(textToDisplay);
    author = normalizeText(author);

    if (MAX_TEXT_LENGTH < textToDisplay) {
        // TODO: Count emojis as single characters
        console.error("Error: Text exceeds 300 character limit");
        return;
    }

    if (style === 'light') {
        TEXT_COLOR = BLACK;
        BORDER_COLOR = WHITE;
        BACKGROUND_COLOR = WHITE;
    }

    loadCustomFonts();

    const canvas = createCanvas(CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = BORDER_COLOR;
    ctx.fillRect(0, 0, CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX);
    ctx.font = QUOTE_FONT_STYLE;  // Important that this line should be before the call to `breakIntoLines`

    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(
        CANVAS_BORDER_WIDTH_PX, 
        CANVAS_BORDER_WIDTH_PX, 
        CANVAS_WIDTH_PX - (2 * CANVAS_BORDER_WIDTH_PX), 
        CANVAS_HEIGHT_PX - (2 * CANVAS_BORDER_WIDTH_PX)
    );
    ctx.lineWidth = CANVAS_BORDER_WIDTH_PX / 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = TEXT_COLOR;
    ctx.setLineDash([5, 15, 30]);
    ctx.strokeRect(
        CANVAS_BORDER_WIDTH_PX,
        CANVAS_BORDER_WIDTH_PX,
        CANVAS_WIDTH_PX - (2 * CANVAS_BORDER_WIDTH_PX), 
        CANVAS_HEIGHT_PX - (2 * CANVAS_BORDER_WIDTH_PX)
    );

    const lines = breakIntoLines(ctx, textToDisplay, CANVAS_PADDING_PX);
    renderQuoteTextAndAuthorName(ctx, lines, author);
    
    if (outputFilePath) {
        return saveCanvasAsPng(canvas, outputFilePath);
    } else {
        return canvas.toBuffer('image/png');
    }
}

/**
 * Load local fonts for canvas to render
 */
function loadCustomFonts() {
    registerFont('./fonts/JosefinSans-Regular.ttf', {
        family: FONT_FAMILY,
        style: 'regular',
    });

    registerFont('./fonts/JosefinSans-Italic.ttf', {
        family: FONT_FAMILY,
        style: 'italic',
    });
}

/**
 * Replace consecutive spaces with a single space 
 * and trim string
 * @param {string} text 
 * @returns {string}
 */
function normalizeText(text) {
    return text ? text.replace(/\s+/g, ' ').trim() : text;
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
 * @param {string[]} quoteLines 
 * @param {string} authorName
 */
function renderQuoteTextAndAuthorName(ctx, quoteLines, authorName) {
    const xCenter  = ctx.canvas.width / 2;
    const yCenter = ctx.canvas.height / 2;
    const maxLineHeight = getMaxLineHeight(ctx, quoteLines);
    let oddNumberOfLines = quoteLines.length % 2 !== 0;
    let lastLineY = yCenter;

    console.log('Rendering Lines');
    ctx.textAlign = 'center';
    ctx.fillStyle = TEXT_COLOR;
    ctx.strokeStyle = TEXT_COLOR;

    if (oddNumberOfLines) {
        const middleLineText = quoteLines[parseInt(quoteLines.length/2)];
        ctx.fillText(middleLineText, xCenter, yCenter);
    }

    if (quoteLines.length > 1) {
        let middleLineIndex = parseInt(quoteLines.length/2);
        let prevLineIdx = middleLineIndex - 1;
        let nextLineIdx = oddNumberOfLines ? middleLineIndex + 1 : middleLineIndex;
        
        // calculate height offset
        let yOffset = TEXT_LINE_HEIGHT_PX + maxLineHeight;

        while (prevLineIdx >= 0) {
            const yPos = yCenter - (yOffset * (middleLineIndex - prevLineIdx));
            ctx.fillText(quoteLines[prevLineIdx], xCenter, yPos);
            prevLineIdx--;
        }
        while (nextLineIdx < quoteLines.length) {
            const yPos = yCenter + (yOffset * (nextLineIdx - middleLineIndex));
            ctx.fillText(quoteLines[nextLineIdx], xCenter, yPos);
            lastLineY = yPos;
            nextLineIdx++;
        }
    }

    if (!!authorName && authorName.length > 0) {
        let maxLineWidth = Math.max(...quoteLines.map(x => x.length));
        if (!authorName.startsWith("-")) {
            authorName = "- " + authorName;
        }
        
        let paddedAuthorName = padLeftWithSpaces(authorName, maxLineWidth);
        let yOffset = TEXT_LINE_HEIGHT_PX + maxLineHeight;
        ctx.font = AUTHOR_FONT_STYLE;
        ctx.fillText(paddedAuthorName, xCenter, lastLineY + yOffset);
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
 * @param {Canvas} canvas
 * @param {string} outputFilePath 
 * @returns {Buffer}
 */
function saveCanvasAsPng(canvas, outputFilePath) {
    console.log('Saving image');
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputFilePath, buffer);
    console.log('Image saved');
    return buffer;
}

/**
 * @param {string} text 
 * @param {number} padLength 
 */
function padLeftWithSpaces(text, padLength) {
    if (text.length > padLength) {
        return text.substring(padLength);
    }

    while (text.length < padLength) {
        text = " " + text;
    }
    return text;
}

module.exports = {
    renderQuote
};