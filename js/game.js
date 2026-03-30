/**
 * 贪吃蛇游戏 - 完整版本
 */

class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // 初始化游戏状态
        this.resetGame();
        this.initEventListeners();
        this.draw();
    }

    resetGame() {
        // 蛇初始化
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };

        // 得分
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;

        // 游戏状态
        this.isRunning = false;
        this.isPaused = false;
        this.gameSpeed = 100;

        // 食物
        this.foods = [];
        this.generateFood();
        this.generateFood();

        this.updateDisplay();
    }

    initEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());

        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // 方向按钮
        document.querySelectorAll('.dir-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const dir = e.target.getAttribute('data-direction');
                this.setDirection(dir);
            });
        });
    }

    handleKeyPress(e) {
        const keyMap = {
            'arrowup': 'up', 'w': 'up',
            'arrowdown': 'down', 's': 'down',
            'arrowleft': 'left', 'a': 'left',
            'arrowright': 'right', 'd': 'right',
            ' ': 'pause'
        };

        const action = keyMap[e.key.toLowerCase()];
        if (action === 'pause') {
            if (this.isRunning) this.togglePause();
        } else if (action) {
            e.preventDefault();
            this.setDirection(action);
        }
    }

    setDirection(dir) {
        const dirMap = {
            'up': { x: 0, y: -1 },
            'down': { x: 0, y: 1 },
            'left': { x: -1, y: 0 },
            'right': { x: 1, y: 0 }
        };

        const newDir = dirMap[dir];
        if (newDir && !(this.direction.x === -newDir.x && this.direction.y === -newDir.y)) {
            this.nextDirection = newDir;
            if (!this.isRunning) this.start();
        }
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            document.getElementById('startBtn').textContent = '进行中...';
            document.getElementById('startBtn').disabled = true;
            document.getElementById('pauseBtn').disabled = false;
            this.gameLoop();
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.textContent = this.isPaused ? '继续' : '暂停';
        if (!this.isPaused) this.gameLoop();
    }

    reset() {
        clearTimeout(this.gameLoopId);
        this.resetGame();
        
        document.getElementById('startBtn').textContent = '开始游戏';
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').textContent = '暂停';
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('gameOverModal').style.display = 'none';
        
        this.draw();
    }

    gameLoop() {
        if (!this.isRunning || this.isPaused) return;

        this.direction = this.nextDirection;
        this.update();
        this.draw();

        this.gameLoopId = setTimeout(() => this.gameLoop(), this.gameSpeed);
    }

    update() {
        // 计算新的蛇头位置
        const head = { 
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };

        // 检查碰撞 - 墙壁
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.endGame('碰到了墙壁');
            return;
        }

        // 检查碰撞 - 自己
        if (this.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
            this.endGame('碰到了自己');
            return;
        }

        this.snake.unshift(head);

        // 检查是否吃到食物
        const foodIndex = this.foods.findIndex(f => f.x === head.x && f.y === head.y);
        if (foodIndex !== -1) {
            this.foods.splice(foodIndex, 1);
            this.score += 10;
            this.generateFood();
        } else {
            this.snake.pop();
        }

        this.updateDisplay();
    }

    generateFood() {
        let food;
        let collision;
        
        do {
            collision = false;
            food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
            
            // 检查是否与蛇重叠
            if (this.snake.some(seg => seg.x === food.x && seg.y === food.y)) {
                collision = true;
            }
        } while (collision);

        this.foods.push(food);
    }

    endGame(reason) {
        this.isRunning = false;
        clearTimeout(this.gameLoopId);

        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
        }

        this.showGameOverModal(reason);
    }

    showGameOverModal(reason) {
        const modal = document.getElementById('gameOverModal');
        document.getElementById('resultMessage').textContent = reason;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalHighScore').textContent = this.highScore;
        document.getElementById('snakeLength').textContent = this.snake.length;
        
        modal.style.display = 'flex';

        document.getElementById('startBtn').textContent = '开始游戏';
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
    }

    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
    }

    draw() {
        // 清空画布
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制网格
        this.ctx.strokeStyle = '#2a2a2a';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i <= this.tileCount; i++) {
            const pos = i * this.gridSize;
            this.ctx.beginPath();
            this.ctx.moveTo(pos, 0);
            this.ctx.lineTo(pos, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, pos);
            this.ctx.lineTo(this.canvas.width, pos);
            this.ctx.stroke();
        }

        // 绘制蛇
        this.snake.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? '#4CAF50' : '#66BB6A';
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });

        // 绘制食物
        this.foods.forEach(food => {
            this.ctx.fillStyle = '#FF5722';
            this.ctx.beginPath();
            this.ctx.arc(
                food.x * this.gridSize + this.gridSize / 2,
                food.y * this.gridSize + this.gridSize / 2,
                this.gridSize / 2 - 2,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        });
    }
}

// 游戏启动
window.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});
