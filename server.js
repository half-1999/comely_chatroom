const express = require('express');
const PORT = 2000 || process.env.PORT
const path = require('path')
const socketIo = require('socket.io')
const http = require('http')
const formatMessages = require('./utils/messages')
const {userJoin,getCurrentUser,userLeave,getRoomUsers} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

app.use(express.static(path.join(__dirname, 'public')))

// client join
io.on('connection' , (socket)=>{


    socket.on('joinRoom' , ({username,room})=>{
        const user = userJoin(socket.id,username,room)

        socket.join(user.room)


        // Welcome current user
        socket.emit('message', formatMessages('Comely Bot ','Welcome To Comely Chatroom...'))         // send welcome msg to new user
        // Broadcast when user connects
        socket.broadcast.to(user.room).emit('message' ,formatMessages('Comely Bot ', `${user.username} has joined the chat ...`))


        // Send user and room info
        io.to(user.room).emit('roomUsers' , {
            room : user.room,
            users : getRoomUsers(user.room)
        })

       
    })


// client disconnect

socket.on('disconnect', ()=>{ 
    const user = userLeave(socket.id)

    if(user){
        io.to(user.room).emit('message',formatMessages('Comely Bot ',`${user.username} has left the chat `))
    }
})
//listen for chatMessage
socket.on('chatMessage' , (msg)=>{
    const user = getCurrentUser(socket.id)

        io.to(user.room).emit('message',formatMessages(user.username,msg))

})
})














































server.listen(PORT , ()=>{
    console.log(`Server is running on PORT ${PORT}`);
})
