'use strict';

const restify = require('restify');
const socketio = require('socket.io');

const server = restify.createServer();
const io = socketio.listen(server.server);

// WebSockets
io.sockets.on('connection', (socket) => {
  console.log("Client '%s' connected to '%s' with id '%s'", socket.client.conn.remoteAddress, socket.handshake.address, socket.id);
  socket.on('disconnect', (reason) => console.log("Client disconnected: %s", reason));
});

// serving static HTML
server.get('/', restify.plugins.serveStatic({
  directory: __dirname + '/../public',
  file: 'index.html'
}))

// REST endpoints
server.post('/:event/:arg', (req, res, next) => {
  let event = req.params.event;
  let arg = req.params.arg;
  console.log("Emitting WebSocket event '%s' with arg '%s'", event, arg);
  io.sockets.emit(event, arg);
  res.send(202);
  next();
});

// start the server
server.listen(process.env.PORT || 3000, () => {
  console.log('%s listening at %s', server.name, server.url);
});

// periodically emit websocket events
setInterval(() => io.sockets.emit('time', new Date().toTimeString()), 1000);
