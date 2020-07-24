
const express = require('express');
const path = require('path')
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words')

const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require('./utils/user');

const app = express();
const server = http.createServer(app); // Create a new Web server
const io = socketio(server)  // Creating instance of the server

const port = process.env.PORT || 3000


const publicDirectory = path.join(__dirname, "../public")

app.use(express.static(publicDirectory));




// Send Message written By user in input box:

io.on('connection', (socket) =>{
        console.log('New webSocket');
      

        // For Join
        socket.on('join', ({username, room}, callback) =>{

            const {error, user} = addUser({id: socket.id, username, room}) //

            

            if(error){ //
                return callback(error)
            }


            socket.join(user.room)   // Allows to join a room, (contains name of room to join)    //
            // By using this method we are only emitting events to that specific room only
            // So that no one can see the messages But only the users in that room
        
            socket.emit('message', generateMessage('Admin',`Welcome!`));    // TimeStamp used
            socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined`));          // emit to only the connected(old) user but not the new user For e.g. Join and Leave notification.
            // we want to send the message to the specific room only
        
            io.to(user.room).emit('roomData',{       //For sideBar
                room: user.room,
                users: getUsersInRoom(user.room)
            })

            callback()
        })


        // socket.on('sendMsg', (message) =>{  // Recieving the msg from client
        //     io.emit('message', message)   // Sending the msg to client
        // })

        // Same as above with callback [ Event acknowledged]
        socket.on('sendMsg', (message,callback) =>{  // Recieving the msg from client
            
            const user = getUser(socket.id) //

            const filter = new Filter() // New instance of Filter
            // Checking for profane words:

            if(filter.isProfane(message)){
                return callback("Porfanity not allowed")
            }
            
            // Emit msgs exclusively to that room
            io.to(user.room).emit('message', generateMessage(user.username, message))   // Sending the msg to client
            
            callback()
        })

        
        // Get geolocation and display in Google Maps:
        
        socket.on('sendLocation', (coords, callback) =>{
            
            const user = getUser(socket.id)
            io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        
            callback()
        }) // Via this you get a google Maps clickeable link

        // Code used when disconnected from server:

        socket.on('disconnect', () =>{     //
            const user =removeUser(socket.id)


            if(user) {
                io.to(user.room).emit('message', generateMessage('Admin' ,`${user.username} has left`))
                
                io.to(user.room).emit('roomData',{       //For sideBar
                    room: user.room,
                    users: getUsersInRoom(user.room)
                })
            }
            
        })
    })



server.listen(port, () =>{
    console.log("Server is up");
})