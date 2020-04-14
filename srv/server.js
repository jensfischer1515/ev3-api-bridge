'use strict';

const restify = require('restify');
const socketio = require('socket.io');

const server = restify.createServer({  
  name: 'ev3-api-bridge',
  version: '1.0.0'
});
const io = socketio.listen(server.server);

// WebSockets
io.sockets.on('connection', (socket) => {
  console.log("Client '%s' connected to '%s' with id '%s'", socket.client.conn.remoteAddress, socket.handshake.address, socket.id);
  socket.on('disconnect', (reason) => console.log("Client disconnected: %s", reason));
});


server.use(restify.plugins.bodyParser({ mapParams: false }));

// serving static HTML
server.get('/', restify.plugins.serveStatic({
  directory: __dirname + '/../public',
  file: 'index.html'
}))

// REST endpoints
server.post('/:event/:arg', (req, res, next) => {
  let event = req.params.event;
  let payload = {
    event: event,
    arg: req.params.arg
  };
  if (req.body) payload["data"] = req.body
  console.log("Emitting WebSocket event '%s' with payload '%s'", event, JSON.stringify(payload));
  io.sockets.emit(event, payload);
  res.send(202);
  next();
});

// start the server
server.listen(process.env.PORT || 3000, () => {
  console.log('%s listening at %s', server.name, server.url);
});

// periodically emit websocket events
setInterval(() => io.sockets.emit('time', new Date().toTimeString()), 1000);
