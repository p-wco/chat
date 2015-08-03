var express = require("express");
var io = require("socket.io").listen(app);
var app = express();
var port = 3000;

var users = [];
 
app.get("/", function(req, res){
    res.send("It works!");
});


/* Socket.IO events */
io.on("connection", function(socket){

	socket.on("newUser", function(data) {
    		participants.push({id: data.id, name: data.name});
    		io.sockets.emit("newConnection", {participants: participants});
  	});

});
 
app.listen(port);
console.log("Listening on port " + port);
