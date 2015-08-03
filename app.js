express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , logger = require('./logger.js')
  , io = require('socket.io').listen(server, {
  	logger : logger
  });

server.listen(3000);
/*

json_obj = JSON.parse(sessionStorage.getItem('object')); //->Creating JSON object from string format

var new_item = {"Vendor":'GUY', "Title": '...', "Year":'...'};

json_obj["Movies"]["Movie"].push(new_item);

JSON.stringify(json_obj) //-> String format

$.each(contacts.data, function()
 {
    id.push(this[0]); // This will be the value "1" from above JSON
    name.push(this[1]); // This will be the value "Skylar Melovia"   from above JSON
 });

*/


// routing
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// usernames which are currently connected to the chat
//var usernames = {};
var usernames = {};
var userIP = {};
var roomUsers = {};
var unames = [];
var numUsers = 0;
var roomJest = 0;
// rooms which are currently available in chat
var rooms = ['Brodnica','Londyn','Reszta', 'WebManiac'];

io.sockets.on('connection', function (socket) {
	//var address = socket.handshake.address;
	var clientIp = socket.request.connection.remoteAddress;
    console.log("New connection from " + clientIp);
    //logger.log('info', 'Hello distributed log files!');
	// logger.info("New connection from " + clientIp);
//console.log('a1');	
	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username){
		// store the username in the socket session for this client
		socket.username = username;
		// store the room name in the socket session for this client
		socket.room = 'Londyn';
		// add the client's username to the global list
		// usernames[username] = username;
		usernames[username] = socket.id;
		logger.info("New connection from " + clientIp +' username: '+username);
		userIP[username] = socket.request.connection.remoteAddress;

		// unames[numUsers] = username;
		// numUsers++;

		// send client to room 1
		socket.join('Londyn');
		// echo to client they've connected
		socket.emit('updatechat', 'SERVER', 'you have connected to '+ socket.room);
		console.log(usernames);
		console.log(socket.id);
		console.log('-----------');
		console.log(userIP);
		console.log('-----------');
		// echo to room 1 that a person has connected to their room
		socket.broadcast.to('Londyn').emit('updatechat', 'SERVER', username + ' has connected to this room');
		socket.emit('updaterooms', rooms, 'Londyn');


		roomUsers[socket.username] = socket.room;
		console.log('room in --'+JSON.stringify(roomUsers));



		//io.sockets.in(socket.room).emit('sendList', JSON.stringify(usernames));
		io.sockets.in(socket.room).emit('sendListR', JSON.stringify(roomUsers));
	});

	socket.on('showUsersR', function (data) {

			console.log('JSON room --'+JSON.stringify(roomUsers));

			io.sockets.in(socket.room).emit('sendListR', JSON.stringify(roomUsers));
			
	});

	socket.on('showUsers', function (data) {
		//for(var i=0, len=usernames.length; i<len; ++i ) {


			console.log('JSON --'+JSON.stringify(usernames));




			//console.log('JSON2 -- '+JSON.stringify(JSON.parse(usernames)));
			//var people = JSON.stringify(usernames);
			//var PJ = people.join();
			//console.log('PJ: '+people.concat(usernames) );
			
			//io.sockets.in(socket.room).emit('sendList', JSON.stringify(usernames));




			io.sockets.in(socket.room).emit('sendList', JSON.stringify(usernames));
			


			//socket.json.send({ your : 'data' });
			
			//console.log(': '+JSON.stringify(usernames));
			// console.log('usernam: '+socket.username);
			// console.log('socket: '+socket.usernames);
		//}

		// io.sockets.in(socket.room).emit('sendList', unames);
		// console.log(unames);
	});

	socket.on('showUsersIp', function (data) {
			//console.log('JSON --'+JSON.stringify(usernames));
			io.sockets.in(socket.room).emit('sendListIp', JSON.stringify(userIP));
	});
	
	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		var $parseHTML;
		// we tell the client to execute 'updatechat' with 2 parameters
		//if(data == 'kick'){
		logger.info('chat: '+data+' {"user": "'+ socket.username+'"}');
		if (data.substring(0, 5) == "kick/") {
    // ...

			var parts = data.split('/');
			//var answer = data[data.length - 1];
			console.log(parts[1]);
			//console.log(answer);
			var wykop = usernames[parts[1]];
			if (io.sockets.connected[wykop]) {
			    io.sockets.connected[wykop].disconnect();
			}

		} else
		if (data.substring(0, 5) == "join/") {
			roomJest = 0;
    // ...

			var parts = data.split('/');
			//var answer = data[data.length - 1];
			var nroom = parts[1];
			//console.log(answer);
			for (var i = 0; i < rooms.length; i++) {
				if(nroom==rooms[i]) roomJest = 1;
			};
			if(roomJest==1){

			}else {
				rooms.push(nroom);
				socket.leave(socket.room);
				socket.join(nroom);
				socket.room = nroom;
				roomUsers[socket.username] = socket.room;
				io.sockets.emit('updaterooms', rooms, '');
				socket.emit('updaterooms', rooms, nroom);
				//socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room '+socket.room);
				//io.sockets.in(socket.room).emit('sendListR', JSON.stringify(roomUsers));
				io.sockets.emit('sendListR', JSON.stringify(roomUsers));
				//var wykop = usernames[parts[1]];
			}

		} else
		//if(message =='showUsers') socket.emit('showUsers', message);
		if(data == 'showUsers') {
			socket.emit('sendList', JSON.stringify(usernames));//io.sockets.in(socket.room).emit('sendList', JSON.stringify(usernames));//io.sockets.in(socket.room).emit('showUsers', data);
		} else
		if(data == 'showUsersIp') {
			//io.sockets.in(socket.room).emit('sendListIp', JSON.stringify(userIP));
			socket.emit('sendListIp', JSON.stringify(userIP));
		}else {
			data = data.replace(/</g, "&lt;").replace(/>/g, "&gt;");
			io.sockets.in(socket.room).emit('updatechat', socket.username, data);
		}
	});
	
	socket.on('switchRoom', function(newroom){
		socket.leave(socket.room);
		socket.join(newroom);
		socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
		// sent message to OLD room
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room '+socket.room);
		delete roomUsers[socket.username];
		roomUsers[socket.username] = newroom;
		io.sockets.in(socket.room).emit('sendListR', JSON.stringify(roomUsers));
		//io.sockets.in(newroom).emit('sendListR', JSON.stringify(roomUsers));


		// update socket session room title
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room '+newroom);
		io.sockets.in(newroom).emit('sendListR', JSON.stringify(roomUsers));
		socket.emit('updaterooms', rooms, newroom);

		//socket.username = username;
		// store the room name in the socket session for this client
		///////socket.room = 'Londyn';
		// add the client's username to the global list
		//roomUsers[socket.username] = newroom;
		console.log('room in switch --'+JSON.stringify(roomUsers));
		//io.sockets.to(socket.room).emit('sendListR', JSON.stringify(roomUsers));
		//io.sockets.in(socket.room).emit('sendListR', JSON.stringify(roomUsers));

	});
	

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		delete roomUsers[socket.username];
		console.log('room out --'+JSON.stringify(roomUsers));
		//delete unames[socket.username];
		//--numUsers;
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		//io.sockets.in(socket.room).emit('sendList', JSON.stringify(usernames));
		io.sockets.in(socket.room).emit('sendListR', JSON.stringify(roomUsers));
		socket.leave(socket.room);

	});
});
