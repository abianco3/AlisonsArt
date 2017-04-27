const sockets = require('socket.io');
const model = require('./database/queries');
const fork = require('child_process').fork;
let io;

module.exports = {
  engine: function () {
    return io;
  },

  init: function (server) {
    io = sockets();
    io.attach(server);
    var socketList = {};
    io.socketList = socketList;
    var worker = fork(__dirname + '/worker.js');
    worker.on('message', function(response) {
      if (response.type === 'notification') {
      // console.log(response, 'closed auctions notifications');
        response.data.forEach((notification) => {
          if (socketList[notification.owner_id]) {
            // console.log('emission occurs', notification.owner_id);
            socketList[notification.owner_id].emit('action', {type: 'UPDATE_NEW_NOTIFICATIONS', data: [notification]});
          }
        })
      } else if (response.type === 'error') {
        // console.log('error with worker');
        io.emit('action', {type: 'ERROR_SOCKET', data: response.data});
      } else if (response.type === 'closed') {
        // console.log('closed', response.data);
        io.emit('action', {type: 'RESPONSE', data: response.data});
      }
    });
    process.on('exit', function () {
        worker.kill();
    });

    io.on('connection', function(socket){
      // console.log('ioengine', io);
      console.log("Socket connected: " + socket.id);
      console.log('number of sockets', io.eio.clientsCount);
      socket.on ('disconnect', () => {
        if (socket.hasOwnProperty('_uid')) {
          delete socketList[socket._uid];
        }
        // console.log('disconnected socket', socketList);
      })
      socket.on('action', (action) => {

        if (action.type === 'socket/hello'){

          // console.log('Got hello data!', action.data);
          socket.emit('action', {type:'RESPONSE', data:'good day!'});

        }

        if (action.type === 'socket/LOGOUT'){
          delete socketList[action.data];
          delete socket._uid;
          // console.log('Got signout data!', action.data, io.eio.clientsCount, socketList);
          socket.emit('action', {type:'RESPONSE', data:'logged out!'});
          socket.emit('action', {type:'socket/LOGOUT_COMPLETE', data: null});
        }
        if (action.type === 'socket/LOGIN'){
          // console.log('Got login data!', action.data);
          model.getUserAuctions(action.data)
          .then((results) => {
            var rooms = results.map(function(room) {
              return 'room:' + room.id;
            });
            rooms.push('room:all');
            rooms.forEach(function(room) {
              socket.join(room, function() {
                // room joining function
                console.log(socket.id, ' joined room ', room);
              });
            });
            socket['_uid'] = action.data;
            socketList[action.data] = socket;
            // console.log('rooms: ', socket.rooms);
            // console.log(socketList, 'socketList');
            socket.emit('action', {type:'RESPONSE', data: 'rooms joined'});
          })
          .catch((error) => {
            console.log('error in room join', error)
            socket.emit('action', {type:'ERROR_SOCKET', data: error});
          });
        }
        if (action.type === 'socket/INITIALIZE_ROOM'){
          var roomname = action.data[2];
          socket.join(roomname);
        }
        if (action.type === 'socket/CHAT_MESSAGE'){
          var roomname = action.data.roomname;
          io.to(roomname).emit('action', {type: 'PASS_MESSAGE', data: action.data});
        }
        console.log('socket.rooms: ', socket.rooms);
      });
    });
    return io;
  },
};
