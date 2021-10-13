

const BG_COLOR='#231f20';
const SNAKE_COLOR = '#c2c2c2'
const FOOD_COLOR = '#e66916'

const socket = io('http://localhost:3000')

socket.on('init', handleInit)
socket.on('gameState', handleGamestate)
socket.on('gameOver', handleGameover)

const gameScreen = document.getElementById('gameScreen')
const homeScreen = document.getElementById('homeScreen')
const createGameBtn = document.getElementById('createGameBtn')
const gameCodeText = document.getElementById('gameCodeText')
const joinGameBtn = document.getElementById('joinGameBtn')

createGameBtn.addEventListener('click', createGame)
joinGameBtn.addEventListener('click', joinGame)

function createGame()
{
    console.log('Create game')
    socket.emit('newGame')
    init()
}

function joinGame()
{
    console.log('Join game')
    const code = gameCodeText.value
    socket.emit('joinGame',code)
    init()
}

function handleGameover()
{
    alert('You lose')
} 

function handleGamestate(gameState)
{
    gameState = JSON.parse(gameState)
    requestAnimationFrame(()=>paintGame(gameState))
}

function handleInit(msg)
{
    console.log(msg)
}


let canvas, ctx;


const gameState = 
{
    player:
    {
        pos:
        {
            x:3,
            y:10,
        },
        vel:
        {
            x: 1,
            y: 0,
        },
        snake:
        [
            {x:1,y:10},
            {x:2,y:10},
            {x:3,y:10},
        ]
    },
    food:
    {
        x:7, 
        y:7
    },
    gridsize: 20
}


function init()
{

    homeScreen.style.display='none'
    gameScreen.style.display='block'

    canvas = document.getElementById('canvas')
    ctx = canvas.getContext('2d')

    canvas.width = canvas.height = 600;

    ctx.fillStyle = BG_COLOR
    ctx.fillRect(0,0,canvas.width, canvas.height)

    document.addEventListener('keydown', keydown)
}

function keydown(e)
{
    socket.emit('keydown',e.keyCode)

}

function paintGame(state)
{
    ctx.fillStyle=BG_COLOR
    ctx.fillRect(0,0,canvas.width, canvas.height)

    const food = state.food
    const gridsize = state.gridsize
    const size = canvas.width / gridsize

    ctx.fillStyle = FOOD_COLOR
    ctx.fillRect(food.x * size, food.y * size, size, size)
    paintPlayer(state.player, size, SNAKE_COLOR)
}

function paintPlayer(playerState, size, color)
{
    const snake = playerState.snake

    ctx.fillStyle = color

    console.log(snake.length)
    snake.forEach(cell => 
    {
        ctx.fillRect(cell.x * size, cell.y * size, size, size)
    });
}


paintGame(gameState)