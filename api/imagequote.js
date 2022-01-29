const { renderQuote } = require('../src/utils/canvasHelper');

const styleOptions = ['light', 'dark'];

export default function handler(request, response) {
    try {
        let { quote, author, style } = request.query;
        if (!quote || quote.length === 0) {
            response.status(400).send({
                error: 'Quote text cannot be empty',
            });
            return;
        }
        author = author || '';
        style = style || '';
        style = style.toLowerCase();

        if (!styleOptions.some(x => x === style)) {
            style = styleOptions[0];
        }

        const imageBuffer = renderQuote(quote, author, '', style);
        response.status(200);
        response.setHeader('Content-Type', 'image/png');
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.send(imageBuffer);
    } catch (error) {
        console.error('Error', error);
        response.status(500);
        response.send({
            error
        });
    }
}