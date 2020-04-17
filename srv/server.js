'use strict';

const restify = require('restify');
const socketio = require('socket.io');

const server = restify.createServer({  
  name: 'ev3-api-bridge',
  version: '1.0.0'
});
const io = socketio.listen(server.server);

// WebSockets
io.on('connection', (socket) => {
  console.log("Client '%s' with session id '%s'", socket.client.conn.remoteAddress, socket.id);
  socket.on('disconnect', (reason) => console.log("Client disconnected: %s", reason));
});

server.use(restify.plugins.bodyParser({ mapParams: false }));

// serving static HTML
server.get('/', restify.plugins.serveStatic({
  directory: __dirname + '/../public',
  file: 'index.html'
}))

// REST endpoints
server.post('/:event/:action/:subaction', (req, res, next) => {
  let event = req.params.event;
  let payload = {
    event: event,
    action: req.params.action,
    subaction: req.params.subaction
  };
  if (req.body) payload['data'] = req.body
  console.log("Emitting WebSocket event '%s' with payload '%s'", event, JSON.stringify(payload));
  io.emit(event, payload);
  res.send(202);
  next();
});

// start the server
server.listen(process.env.PORT || 3000, () => {
  console.log('%s listening at %s', server.name, server.url);
});

// periodically emit websocket events
setInterval(() => io.emit('time', { date: new Date().toTimeString()}), 1000);
