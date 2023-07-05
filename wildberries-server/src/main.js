import { createServer } from 'http';
import articles from './articles.js';
import Parser from './parser.js';

const server = createServer(async (req, res) => {
	switch (req.url) {
		case '/':
			const itemsInStock = await new Parser(articles).getInfoItems();

			res.writeHead(200, {
				'Content-Type': 'application/json'
			});
			res.end(JSON.stringify(itemsInStock));
			break;
		default:
			res.writeHead(404, {
				'Content-Type': 'application/json'
			});
			res.end(JSON.stringify({ error: '404 Not Found!' }));
			break;
	}
});

const port = 4000;

server.listen(port, 'localhost', () =>
	console.log(`[*] Server listening on port - ${port}`)
);
