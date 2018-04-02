const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io').listen(server)

connections = []

server.listen(3000)
console.log("Serving HTTP on port:3000")

app.use(express.static("./client"))

app.get('/', (request, response) => {
    response.sendFile("./static/index.html")
})

io.sockets.on('connection', (socket) => {
    connections.push(socket)

    socket.on("Add grocery", (data) => {
        io.sockets.emit("Add", data)
    })

    socket.on("Update grocery", (data) => {
        io.sockets.emit('Update', data)
    })

    socket.on("Remove grocery", (data) => {
        io.sockets.emit("Remove", data)
    })
})