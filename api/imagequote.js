const { renderQuote } = require('../src/utils/canvasHelper');

export default function handler(request, response) {
    try {
        response.setHeader('Content-Type', 'application/json');
        if (request.method !== 'POST') {
            response.status(400).send({
                error: 'Only POST requests are supported',
            });
            return;
        }
        if (!request.body) {
            response.status(400).send({
                error: 'Request body cannot be empty',
            });
            return;
        }
        
        let { quoteText, authorName, styleName } = request.body;
        if (!quoteText || quoteText.length === 0) {
            response.status(400).send({
                error: 'Quote text cannot be empty',
            });
            return;
        }
        
        authorName = authorName || '';
        styleName = (styleName || '').toLowerCase();

        const imageBuffer = renderQuote(quoteText, authorName, '', styleName);
        response.status(200);
        response.setHeader('Content-Type', 'image/png');
        response.setHeader('Content-Length', Buffer.byteLength(imageBuffer));
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