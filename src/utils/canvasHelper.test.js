const { quotes } = require('../testdata/quotes');
const { renderQuote, SupportedColorThemes } = require('./canvasHelper');
const path = require('path');

const isCiEnv = process.env.CI === 'true';

const testCases = [
    {
        title: 'Single word without author',
        quote: 'Great.',
        author: '',
    },
    {
        title: 'Single word with author',
        quote: 'Great.',
        author: 'Someone',
    },
    {
        title: 'Single Line without author',
        quote: 'This is a test.',
        author: ''
    },
    {
        title: 'Single line with author',
        quote: 'This is a test.',
        author: 'Someone'
    },
    {
        title: 'Two lines without author',
        quote: 'Many things prevent knowledge, including the obscurity of the subject and the brevity of human knowledge.',
        author: '',
    },
    {
        title: 'Two lines with author',
        quote: 'Many things prevent knowledge, including the obscurity of the subject and the brevity of human knowledge.',
        author: 'Protagoras',
    },
    {
        title: 'More than two lines without author',
        quote: "Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma — which is living with the results of other people's thinking.",
        author: ''
    },
    {
        title: 'More than two lines with author',
        quote: "Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma — which is living with the results of other people's thinking.",
        author: 'Steve Jobs'
    }
];

describe('CanvasHelper Generic Cases', () => {
    SupportedColorThemes.forEach(colorTheme => {
        testCases.forEach(testcase => {    
            test(testcase.title + ' [' + colorTheme + ']', () => {
                const outputFilename = getOutputFilePath(createFilename(testcase.title + ' ' + colorTheme));
                const buffer = renderQuote(testcase.quote, testcase.author, isCiEnv ? '' : outputFilename, colorTheme);
                expect(buffer).toBeTruthy();
            });
        });
    });
});

describe('CanvasHelper Random Quotes', () => {
    let count = 1;
    quotes.forEach(quote => {
        test(`random-${count}`, () => {
            let quoteEndIndex = quote.lastIndexOf('—');
            let quoteText = quote.substring(0, quoteEndIndex);
            let author = quote.substring(quoteEndIndex, quote.length);
            let outputFilename = getOutputFilePath(`random-${count}.png`);
            
            const buffer = renderQuote(quoteText, author, isCiEnv ? '' : outputFilename);
            expect(buffer).toBeTruthy();
            count++;
        });
    });
});

/** 
 * @param {string} text 
 * @returns {string}
 */
function createFilename(text) {
    return text.trim().replace(/\s+/g, '-') + '.png';
}

function getOutputFilePath(filename) {
    return path.join(__dirname, '..', '..', 'test-outputs', filename);
}