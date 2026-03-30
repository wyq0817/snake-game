// Snake Game Implementation

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const box = 20;
const snake = [{ x: 5 * box, y: 5 * box }];
let direction;
let food = {
    x: Math.floor(Math.random() * 13 + 1) * box,
    y: Math.floor(Math.random() * 13 + 1) * box
};

// Control the snake
document.addEventListener('keydown', directionControl);
function directionControl(event) {
    if (event.keyCode == 37 && direction != 'RIGHT') {
        direction = 'LEFT';
    } else if (event.keyCode == 38 && direction != 'DOWN') {
        direction = 'UP';
    } else if (event.keyCode == 39 && direction != 'LEFT') {
        direction = 'RIGHT';
    } else if (event.keyCode == 40 && direction != 'UP') {
        direction = 'DOWN';
    }
}

// Draw everything on the canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the food
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, box, box);

    // Draw the snake
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i == 0) ? 'green' : 'white';
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    // Old head position
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    // Move the snake
    if (direction == 'LEFT') snakeX -= box;
    if (direction == 'UP') snakeY -= box;
    if (direction == 'RIGHT') snakeX += box;
    if (direction == 'DOWN') snakeY += box;

    // If the snake eats the food
    if (snakeX == food.x && snakeY == food.y) {
        food = {
            x: Math.floor(Math.random() * 13 + 1) * box,
            y: Math.floor(Math.random() * 13 + 1) * box
        };
    } else {
        // Remove the tail
        snake.pop();
    }

    // Add new head
    const newHead = { x: snakeX, y: snakeY };  

    // Game over conditions
    if (snakeX < box || snakeX > 13 * box || snakeY < box || snakeY > 13 * box || collision(newHead, snake)) {
        clearInterval(game);
        alert('Game Over!');
        return;
    }

    snake.unshift(newHead);
}

function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x == array[i].x && head.y == array[i].y) {
            return true;
        }
    }
    return false;
}

const game = setInterval(draw, 100);
