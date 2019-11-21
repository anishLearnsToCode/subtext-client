const express = require('express');
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendfile('index.html');
});

let connectedSockets = {};
let allUsers = [{nickname: "", color: "#000"}];

io.on('connection', function(socket) {

    socket.on('addUser',function(data){
        if(connectedSockets[data.nickname]){
          socket.emit('userAddingResult',{result:false});
        }else{
            socket.emit('userAddingResult',{result:true});
            socket.nickname=data.nickname;
            connectedSockets[socket.nickname]=socket;
            allUsers.push(data);
            socket.broadcast.emit('userAdded',data);
            socket.emit('allUser',allUsers);
        }

    });

    socket.on('addMessage',function(data){
        console.log(data);
        if (data.to) {
            connectedSockets[data.to].emit('messageAdded',data);
            console.log(data);
        } else {
            socket.broadcast.emit('messageAdded',data);
        }
    });

    socket.on('disconnect', function () {
            socket.broadcast.emit('userRemoved', {
                nickname: socket.nickname
            });
            for(let i=0 ; i<allUsers.length ; i++){
                if(allUsers[i].nickname === socket.nickname){
                    allUsers.splice(i,1);
                }
            }
            delete connectedSockets[socket.nickname];

        }
    );
});

http.listen(3002, function () {
    console.log('listening on *:3002');
});
