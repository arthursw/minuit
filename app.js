var path = require('path');
var express = require('express');

var app = express();

var staticPath = path.join(__dirname, '/docs');
app.use(express.static(staticPath));

app.listen(3000, function() {
  console.log('listening');
});

const WebSocket = require('ws');

let wss = null;

let onConnection = (ws)=> {
	ws.on('message', function incoming(data) {
		// Broadcast to everyone else.
		wss.clients.forEach(function each(client) {
			if (client !== ws && client.readyState === WebSocket.OPEN) {
				client.send(data);
			}
		});
	});

    ws.on('open', function() {
    })
    ws.on('close', function() {
    })
}

wss = new WebSocket.Server({ port: 3545 })
wss.on('connection', onConnection)

