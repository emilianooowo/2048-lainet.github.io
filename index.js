class Game2048 {
    constructor() {
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('best2048') || '0');
        this.size = 4;
        this.gameEnded = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;

        this.initializeGrid();
        this.updateDisplay();
        this.bindEvents();
    }

    initializeGrid() {
        this.grid = [];
        for (let i = 0; i < this.size; i++) {
            this.grid[i] = new Array(this.size).fill(0);
        }
        this.createGridElements();
        this.addRandomTile();
        this.addRandomTile();
    }

    createGridElements() {
        const gridElement = document.getElementById('grid');
        gridElement.innerHTML = '';

        for (let i = 0; i < this.size * this.size; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${Math.floor(i / this.size)}-${i % this.size}`;
            gridElement.appendChild(cell);
        }
    }

    addRandomTile(animate = true) {
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

            if (animate) {
                setTimeout(() => this.updateDisplay(), 50);
            }
        }
    }

    move(direction) {
        if (this.gameEnded) return;

        let moved = false;
        const mergedPositions = new Set();

        switch (direction) {
            case 'ArrowLeft':
            case 'left':
                moved = this.moveLeft(mergedPositions);
                break;
            case 'ArrowRight':
            case 'right':
                moved = this.moveRight(mergedPositions);
                break;
            case 'ArrowUp':
            case 'up':
                moved = this.moveUp(mergedPositions);
                break;
            case 'ArrowDown':
            case 'down':
                moved = this.moveDown(mergedPositions);
                break;
        }

        if (moved) {
            setTimeout(() => {
                this.addRandomTile();
                this.checkGameState();
            }, 150);
        }
    }

    moveLeft(mergedPositions) {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i].filter(val => val !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row[j + 1] = 0;
                    mergedPositions.add(`${i}-${j}`);
                }
            }
            const newRow = row.filter(val => val !== 0);
            while (newRow.length < this.size) {
                newRow.push(0);
            }

            if (JSON.stringify(this.grid[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.grid[i] = newRow;
        }
        this.updateDisplay(mergedPositions);
        return moved;
    }

    moveRight(mergedPositions) {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i].filter(val => val !== 0);
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row[j - 1] = 0;
                    mergedPositions.add(`${i}-${this.size - 1 - (row.length - 1 - j)}`);
                }
            }
            const newRow = row.filter(val => val !== 0);
            while (newRow.length < this.size) {
                newRow.unshift(0);
            }

            if (JSON.stringify(this.grid[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.grid[i] = newRow;
        }
        this.updateDisplay(mergedPositions);
        return moved;
    }

    moveUp(mergedPositions) {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            const column = [];
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== 0) {
                    column.push(this.grid[i][j]);
                }
            }

            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column[i + 1] = 0;
                    mergedPositions.add(`${i}-${j}`);
                }
            }

            const newColumn = column.filter(val => val !== 0);
            while (newColumn.length < this.size) {
                newColumn.push(0);
            }

            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== newColumn[i]) {
                    moved = true;
                }
                this.grid[i][j] = newColumn[i];
            }
        }
        this.updateDisplay(mergedPositions);
        return moved;
    }

    moveDown(mergedPositions) {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            const column = [];
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== 0) {
                    column.push(this.grid[i][j]);
                }
            }

            for (let i = column.length - 1; i > 0; i--) {
                if (column[i] === column[i - 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column[i - 1] = 0;
                    mergedPositions.add(`${this.size - 1 - (column.length - 1 - i)}-${j}`);
                }
            }

            const newColumn = column.filter(val => val !== 0);
            while (newColumn.length < this.size) {
                newColumn.unshift(0);
            }

            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== newColumn[i]) {
                    moved = true;
                }
                this.grid[i][j] = newColumn[i];
            }
        }
        this.updateDisplay(mergedPositions);
        return moved;
    }

    updateDisplay(mergedPositions = new Set()) {
        // Update score
        document.getElementById('score').textContent = this.score;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('best2048', this.bestScore.toString());
        }
        document.getElementById('best-score').textContent = this.bestScore;

        // Update grid
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const cell = document.getElementById(`cell-${i}-${j}`);
                cell.innerHTML = '';

                if (this.grid[i][j] !== 0) {
                    const tile = document.createElement('div');
                    const tileClass = `tile tile-${this.grid[i][j] <= 2048 ? this.grid[i][j] : 'super'}`;

                    if (mergedPositions.has(`${i}-${j}`)) {
                        tile.className = `${tileClass} merged`;
                    } else {
                        tile.className = tileClass;
                    }

                    tile.textContent = this.grid[i][j];
                    cell.appendChild(tile);
                }
            }
        }
    }

    checkGameState() {
        // Check if won
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 2048) {
                    this.showMessage('Congratulations! You won!', 'win');
                    this.gameEnded = true;
                    return;
                }
            }
        }

        // Check if can move
        if (!this.canMove()) {
            this.showMessage('Game Over! No more moves available.', 'lose');
            this.gameEnded = true;
        }
    }

    canMove() {
        // Check for empty cells
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) return true;
            }
        }

        // Check for possible merges
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.grid[i][j];
                if (
                    (j < this.size - 1 && current === this.grid[i][j + 1]) ||
                    (i < this.size - 1 && current === this.grid[i + 1][j])
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    showMessage(text, type) {
        const messageElement = document.getElementById('game-message');
        messageElement.textContent = text;
        messageElement.className = `game-message ${type === 'win' ? 'message-win' : 'message-lose'} show`;
    }

    hideMessage() {
        const messageElement = document.getElementById('game-message');
        messageElement.className = 'game-message';
        this.gameEnded = false;
    }

    handleTouchStart(e) {
        e.preventDefault();
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
    }

    handleTouchEnd(e) {
        e.preventDefault();
        this.touchEndX = e.changedTouches[0].clientX;
        this.touchEndY = e.changedTouches[0].clientY;
        this.handleSwipe();
    }

    handleSwipe() {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        const minSwipeDistance = 50;

        if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
            return;
        }

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (deltaX > 0) {
                this.move('right');
            } else {
                this.move('left');
            }
        } else {
            // Vertical swipe
            if (deltaY > 0) {
                this.move('down');
            } else {
                this.move('up');
            }
        }
    }

    bindEvents() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                e.preventDefault();
                this.move(e.key);
            }
        });

        // Touch events
        const grid = document.getElementById('grid');
        grid.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        grid.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        grid.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    }

    newGame() {
        this.score = 0;
        this.gameEnded = false;
        this.initializeGrid();
        this.updateDisplay();
        this.hideMessage();
    }
}

let game;

function openGame() {
    document.getElementById('lightbox').classList.add('active');
    game = new Game2048();
}

function closeGame() {
    document.getElementById('lightbox').classList.remove('active');
}

function newGame() {
    if (game) {
        game.newGame();
    }
}

document.addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') {
        closeGame();
    }
});
