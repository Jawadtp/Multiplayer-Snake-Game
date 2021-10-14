const app = require('express')
const http = require('http').createServer(app)
const {gameLoop, getUpdatedVelocity, initGame} = require('./game')
const {makeid} = require('./utils')
const {FRAME_RATE} = require('./constants')
const { off } = require('process')


const io = require('socket.io')(http,{
    cors: 
    {
      origin: 'http://127.0.0.1:5500'
    }
})

const state = {}
const clientRooms = {}

io.on('connection', socket => 
{
    socket.emit('init', {data: 'hello world'})

    const state = initGame()

    socket.on('keydown', handleKeydown)
    socket.on('newGame', handleNewGame)
    socket.on('joinGame', handleJoinGame)

    function handleNewGame()
    {
        let roomName = makeid(5)
        clientRooms[socket.id]=roomName
        socket.emit('gameCode', roomName)

        state[roomName] = initGame()

        socket.join(roomName)
        socket.number = 1
        socket.emit('init', 1)
    }

    function handleJoinGame(roomName)
    {
        const room = io.sockets.adapter.rooms[roomName]
        let allUsers

     /*   if(room)
            allUsers=room.sockets
        
        let numclients = 0
        
        if(allUsers) numclients = Objects.keys(allUsers).length

        if(numclients===0)
        {
            socket.emit('unknownRoom')
            return
        }

        if(numclients>1)
        {
            client.emit('tooManyPlayers')
            return
        }
*/
        clientRooms[socket.id] = roomName
        socket.join(roomName)
        socket.number = 2
        socket.emit('init', 2)

        stateGameInterval(roomName)
    }

    function handleKeydown(keyCode)
    {
        const roomName = clientRooms[socket.id]

        if(!roomName) return

        try
        {
            keyCode = parseInt(keyCode)
        }
        catch(e)
        {
            console.error(e)
            return
        }

        const vel = getUpdatedVelocity(keyCode)
        
        if(vel && vel.x!=state[roomName].players[socket.number-1].vel.x && vel.y!=state[roomName].players[socket.number-1].vel.y) //We dont want the snake to move down and collide with itself if it is already moving up.
            state[roomName].players[socket.number-1].vel = vel
    }

})  

function stateGameInterval(roomName) 
{
    const intervalId = setInterval(()=> 
    {
        //console.log(state)
        const winner = gameLoop(state[roomName]) //gameLoop returns the winner if any for the passed state.
       // var winner = false
        if(!winner)
        {
            emitGameState(roomName, state[roomName])
         //   client.emit('gameState', JSON.stringify(state))
        }
        else
        {
            emitGameOver(roomName, winner)
            state[roomName]=null
           // client.emit('gameOver')
            clearInterval(intervalId)
        }


    }, 1000/FRAME_RATE)
}

function emitGameState(roomName, state)
{
    io.sockets.in(roomName).emit('gameState', JSON.stringify(state))
}

function emitGameOver(roomname, winner)
{
    io.sockets.in(roomName).emit('gameOver', JSON.stringify({winner}))

}

http.listen(3000, function () 
{
    console.log('Listening on port 3000')
})