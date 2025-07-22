class Game2048 {
    constructor() {
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore2048')) || 0;
        this.previousState = null;
        this.size = 4;
        this.cellSize = 0;
        this.gameWon = false;

        this.initializeGrid();
        this.setupEventListeners();
        this.calculateCellSize();
    }

    initializeGrid() {
        this.grid = [];
        for (let i = 0; i < this.size; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.size; j++) {
                this.grid[i][j] = 0;
            }
        }
    }

    calculateCellSize() {
        const gameBoard = document.getElementById('gameBoard');
        const boardWidth = Math.min(400, window.innerWidth - 60);
        const gap = 10;
        this.cellSize = (boardWidth - 30 - (gap * 3)) / 4;

        gameBoard.style.width = boardWidth + 'px';

        const cells = document.querySelectorAll('.cell, .tile');
        cells.forEach(cell => {
            cell.style.width = this.cellSize + 'px';
            cell.style.height = this.cellSize + 'px';
        });
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (!document.getElementById('gameModal').classList.contains('active')) return;

            e.preventDefault();
            switch (e.key) {
                case 'ArrowUp': this.move('up'); break;
                case 'ArrowDown': this.move('down'); break;
                case 'ArrowLeft': this.move('left'); break;
                case 'ArrowRight': this.move('right'); break;
            }
        });

        let startX, startY;
        const gameBoard = document.getElementById('gameBoard');

        gameBoard.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        }, { passive: false });

        gameBoard.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        gameBoard.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!startX || !startY) return;

            const touch = e.changedTouches[0];
            const diffX = startX - touch.clientX;
            const diffY = startY - touch.clientY;
            const minSwipeDistance = 30;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (Math.abs(diffX) > minSwipeDistance) {
                    this.move(diffX > 0 ? 'left' : 'right');
                }
            } else {
                if (Math.abs(diffY) > minSwipeDistance) {
                    this.move(diffY > 0 ? 'up' : 'down');
                }
            }

            startX = null;
            startY = null;
        }, { passive: false });

        window.addEventListener('resize', () => {
            this.calculateCellSize();
        });
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }

        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    saveState() {
        this.previousState = {
            grid: this.grid.map(row => [...row]),
            score: this.score
        };
    }

    move(direction) {
        this.saveState();
        let moved = false;
        const newGrid = this.grid.map(row => [...row]);

        if (direction === 'left') {
            for (let i = 0; i < this.size; i++) {
                const row = this.slideAndMerge(newGrid[i]);
                if (!this.arraysEqual(newGrid[i], row)) moved = true;
                newGrid[i] = row;
            }
        } else if (direction === 'right') {
            for (let i = 0; i < this.size; i++) {
                const row = this.slideAndMerge(newGrid[i].slice().reverse()).reverse();
                if (!this.arraysEqual(newGrid[i], row)) moved = true;
                newGrid[i] = row;
            }
        } else if (direction === 'up') {
            for (let j = 0; j < this.size; j++) {
                const column = [];
                for (let i = 0; i < this.size; i++) {
                    column.push(newGrid[i][j]);
                }
                const newColumn = this.slideAndMerge(column);
                if (!this.arraysEqual(column, newColumn)) moved = true;
                for (let i = 0; i < this.size; i++) {
                    newGrid[i][j] = newColumn[i];
                }
            }
        } else if (direction === 'down') {
            for (let j = 0; j < this.size; j++) {
                const column = [];
                for (let i = 0; i < this.size; i++) {
                    column.push(newGrid[i][j]);
                }
                const newColumn = this.slideAndMerge(column.slice().reverse()).reverse();
                if (!this.arraysEqual(column, newColumn)) moved = true;
                for (let i = 0; i < this.size; i++) {
                    newGrid[i][j] = newColumn[i];
                }
            }
        }

        if (moved) {
            this.grid = newGrid;
            this.addRandomTile();
            this.updateDisplay();
            this.checkGameState();
        }
    }

    slideAndMerge(arr) {
        const filtered = arr.filter(val => val !== 0);
        const merged = [];
        let i = 0;

        while (i < filtered.length) {
            if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
                const mergedValue = filtered[i] * 2;
                merged.push(mergedValue);
                this.score += mergedValue;
                i += 2;
            } else {
                merged.push(filtered[i]);
                i++;
            }
        }

        while (merged.length < this.size) {
            merged.push(0);
        }

        return merged;
    }

    arraysEqual(arr1, arr2) {
        return arr1.length === arr2.length && arr1.every((val, index) => val === arr2[index]);
    }

    createGrid() {
        const gridElement = document.getElementById('grid');
        gridElement.innerHTML = '';

        for (let i = 0; i < this.size * this.size; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.width = this.cellSize + 'px';
            cell.style.height = this.cellSize + 'px';
            gridElement.appendChild(cell);
        }

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== 0) {
                    this.createTile(i, j, this.grid[i][j]);
                }
            }
        }
    }

    createTile(row, col, value) {
        const tile = document.createElement('div');
        tile.className = `tile tile-${value}`;
        tile.textContent = value;
        tile.style.width = this.cellSize + 'px';
        tile.style.height = this.cellSize + 'px';
        tile.style.left = (col * (this.cellSize + 10)) + 'px';
        tile.style.top = (row * (this.cellSize + 10)) + 'px';

        const gridElement = document.getElementById('grid');
        gridElement.appendChild(tile);

        setTimeout(() => tile.classList.add('appeared'), 10);
    }

    updateDisplay() {
        const tiles = document.querySelectorAll('.tile');
        tiles.forEach(tile => tile.remove());

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== 0) {
                    this.createTile(i, j, this.grid[i][j]);
                }
            }
        }

        const scoreElement = document.getElementById('score');
        const scoreBox = scoreElement.parentElement;
        scoreElement.textContent = this.score;

        scoreBox.classList.add('highlight');
        setTimeout(() => scoreBox.classList.remove('highlight'), 300);

        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore2048', this.bestScore);
            document.getElementById('bestScore').textContent = this.bestScore;

            const bestScoreBox = document.getElementById('bestScore').parentElement;
            bestScoreBox.classList.add('highlight');
            setTimeout(() => bestScoreBox.classList.remove('highlight'), 300);
        }
    }

    checkGameState() {
        if (!this.gameWon) {
            for (let i = 0; i < this.size; i++) {
                for (let j = 0; j < this.size; j++) {
                    if (this.grid[i][j] === 2048) {
                        this.gameWon = true;
                        this.showGameOver('You Won!', 'win');
                        return;
                    }
                }
            }
        }

        if (!this.canMove()) {
            this.showGameOver('Game Over!', 'lose');
        }
    }

    canMove() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) return true;
            }
        }

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.grid[i][j];
                if (
                    (i > 0 && this.grid[i - 1][j] === current) ||
                    (i < this.size - 1 && this.grid[i + 1][j] === current) ||
                    (j > 0 && this.grid[i][j - 1] === current) ||
                    (j < this.size - 1 && this.grid[i][j + 1] === current)
                ) {
                    return true;
                }
            }
        }

        return false;
    }

    showGameOver(message, type) {
        const gameOver = document.getElementById('gameOver');
        const title = document.getElementById('gameOverTitle');
        title.textContent = message;
        title.className = type;
        gameOver.classList.add('active');
    }

    newGame() {
        this.initializeGrid();
        this.score = 0;
        this.gameWon = false;
        this.previousState = null;

        this.addRandomTile();
        this.addRandomTile();

        document.getElementById('gameOver').classList.remove('active');

        this.updateDisplay();
    }

    undoMove() {
        if (this.previousState) {
            this.grid = this.previousState.grid.map(row => [...row]);
            this.score = this.previousState.score;
            this.previousState = null;
            this.updateDisplay();
        }
    }

    start() {
        document.getElementById('bestScore').textContent = this.bestScore;
        this.calculateCellSize();
        this.createGrid();
        this.newGame();
    }
}

let game;

function openGame() {
    const modal = document.getElementById('gameModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        if (!game) {
            game = new Game2048();
        }
        game.start();
    }, 150);
}

function closeGame() {
    const modal = document.getElementById('gameModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function newGame() {
    if (game) {
        game.newGame();
    }
}

function undoMove() {
    if (game) {
        game.undoMove();
    }
}

document.addEventListener('touchmove', (e) => {
    if (document.getElementById('gameModal').classList.contains('active')) {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('gameModal').classList.contains('active')) {
        closeGame();
    }
});