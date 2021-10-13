const app = require('express')
const http = require('http').createServer(app)
const {createGameState, gameLoop, getUpdatedVelocity} = require('./game')
const {FRAME_RATE} = require('./constants')


const io = require('socket.io')(http,{
    cors: 
    {
      origin: 'http://127.0.0.1:5500'
    }
})


function stateGameInterval(client, state) 
{
    const intervalId = setInterval(()=> 
    {
        //console.log(state)
        const winner = gameLoop(state) //gameLoop returns the winner if any for the passed state.
       // var winner = false
        if(!winner)
        {
            client.emit('gameState', JSON.stringify(state))
        }
        else
        {
            client.emit('gameOver')
            clearInterval(intervalId)
        }


    }, 1000/FRAME_RATE)
}

io.on('connection', socket => 
{
    socket.emit('init', {data: 'hello world'})

    const state = createGameState()

    socket.on('keydown', handleKeydown)

    function handleKeydown(keyCode)
    {
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
        
        if(vel && vel.x!=state.player.vel.x && vel.y!=state.player.vel.y) //We dont want the snake to move down and collide with itself if it is already moving up.
            state.player.vel = vel
    }

    stateGameInterval(socket, state)
})  


http.listen(3000, function () 
{
    console.log('Listening on port 3000')
})