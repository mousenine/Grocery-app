const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io').listen(server)

connections = []
lists = {}

server.listen(3000)
console.log("Serving HTTP on port:3000")

app.use(express.static("./client"))

app.get('/', (request, response) => {
    response.sendFile("./static/index.html")
})

io.sockets.on('connection', (socket) => {
    connections.push(socket)
    console.log(`There are currently ${connections.length} connections active`)

    socket.on("Add grocery", (data) => {
        io.sockets.emit("Add", data)
    })

    socket.on("Update grocery", (data) => {
        io.sockets.emit('Update', data)
    })

    socket.on("Remove grocery", (data) => {
        io.sockets.emit("Remove", data)
    })

    socket.on("Register list", (data) => {
        if(lists[data]) {
            socket.emit("List name taken", ["list-name", true])
        } else {
            socket.emit("List name taken", ["list-name", false])
            lists[data] = {"socket": socket.id}
        }
        console.log(`A new list was registered by the name of: "${data}" with a socket id of: "${socket.id}"`)
    })

    socket.on("Send sync data", (data) => {
        socket.broadcast.to(data.name).emit('Sync list', data.list)
    })
    
    socket.on("Sync lists", (data) => {
        if(!lists[data.nameSync]) {
            socket.emit("List name taken", ["target-list-name", false])
        } else {
            socket.emit("List name taken", ["target-list-name", true])
            socket.broadcast.to(lists[data.nameSync].socket).emit('Prepare sync data', data.name)
        }
    })
})