new Vue({
    el: "#app",
    data: {
        title: "Minesweeper",
        options: {
            w: 5,
            h: 5,
            mines: 1,
            lives: 3
        },
        tiles: [],
        lives: 0,
        optionsToggle: false,
        timer: 0,
        timerId: 0
    },
    created() {
        this.setOptions()
        this.newGame()
    },
    computed: {
        flags() {
            return this.tiles.flat().filter(t => t.isFlag).length
        },
        opened() {
            return this.tiles.flat().filter(t => t.isOpen).length
        },
        openedBombs() {
            return this.tiles.flat().filter(t => t.isOpen && t.isBomb).length
        },
        minesLeft() {
            return this.options.mines - this.flags - this.openedBombs
        },
        totalTiles() {
            return this.options.w * this.options.h
        },
        splitTimer() {
            let h = Math.floor(this.timer / 3600)
            let m = Math.floor((this.timer - h * 3600) / 60)
            let s = Math.floor((this.timer - h * 3600 - m * 60))
            return { h, m, s }
        },
        prettyTimer() {
            return this.format(this.splitTimer.h) + ":" + this.format(this.splitTimer.m) + ":" + this.format(this.splitTimer.s)
        }

    },
    methods: {
        format(time) {
            return (time < 10 ? "0" : "") + time
        },
        setOptions() {
            let uri = window.location.search.substring(1);
            let params = new URLSearchParams(uri);
            if (params.has("w")) {
                this.options.w = Math.min(40, parseInt(params.get("w")))
            }
            if (params.has("h")) {
                this.options.h = Math.min(40, parseInt(params.get("h")))
            }
            if (params.has("m")) {
                this.options.mines = Math.min(this.options.w * this.options.h, parseInt(params.get("m")))
            }
            if (params.has("l")) {
                this.options.lives = Math.min(10, parseInt(params.get("l")))
            }
        },
        newGame() {
            this.tiles = []
            this.lives = this.options.lives
            for (let i = 0; i < this.options.h; i++) {
                let row = []
                for (let j = 0; j < this.options.w; j++) {
                    row.push({
                        x: j, y: i, isBomb: false, isFlag: false, isOpen: false, bombs: 0
                    })
                }
                this.tiles.push(row)
            }

            let placed = 0
            while (placed < this.options.mines) {
                let y = Math.floor(Math.random() * this.options.h)
                let x = Math.floor(Math.random() * this.options.w)
                if (!this.tiles[y][x].isBomb) {
                    this.tiles[y][x].isBomb = true
                    placed++
                }
            }
            for (let i = 0; i < this.options.h; i++) {
                for (let j = 0; j < this.options.w; j++) {
                    if (!this.tiles[i][j].isBomb) {
                        this.tiles[i][j].bombs = this.bombAround(j, i)
                    }
                }
            }
            this.stopTimer()
            this.resetTimer()
            this.startTimer()

        },
        startTimer() {
            this.timerId = setInterval(() => {
                this.timer++
            }, 1000)
        },
        resetTimer() {
            this.timer = 0
        },
        stopTimer() {
            clearInterval(this.timerId)
            this.timerId = null
        },
        bombAround(x, y) {
            let bombs = 0
            let tilesAround = this.tilesAround(x, y)
            for (let i = 0; i < tilesAround.length; i++) {
                if (this.tiles[tilesAround[i].y][tilesAround[i].x].isBomb) {
                    bombs++
                }
            }
            return bombs
        },
        tilesAround(x, y) {
            let tiles = []
            if (x > 0) { tiles.push({ y, x: x - 1 }) }
            if (y > 0) { tiles.push({ y: y - 1, x }) }
            if (x < this.options.w - 1) { tiles.push({ y, x: x + 1 }) }
            if (y < this.options.h - 1) { tiles.push({ y: y + 1, x: x }) }
            if (x > 0 && y > 0) { tiles.push({ y: y - 1, x: x - 1 }) }
            if (x > 0 && y < this.options.h - 1) { tiles.push({ y: y + 1, x: x - 1 }) }
            if (x < this.options.w - 1 && y > 0) { tiles.push({ y: y - 1, x: x + 1 }) }
            if (x < this.options.w - 1 && y < this.options.h - 1) { tiles.push({ y: y + 1, x: x + 1 }) }
            return tiles;
        },
        leftClick(x, y) {
            if (!this.tiles[y][x].isOpen) {
                this.openTile(x, y, [])
            }
            this.verify()
        },
        rightClick(x, y) {
            if (!this.tiles[y][x].isOpen) {
                this.tiles[y][x].isFlag = !this.tiles[y][x].isFlag
            }
            this.verify()
        },

        openTile(x, y, opened) {
            if (this.tiles[y][x].isFlag) {
                return
            }
            if (this.tiles[y][x].isBomb) {
                this.tiles[y][x].isOpen = true
                console.log("You exploded !")
                this.lives--
                return
            }
            this.tiles[y][x].isOpen = true
            opened.push({ x, y })
            if (this.tiles[y][x].bombs == 0) {
                let tilesAround = this.tilesAround(x, y)
                for (let i = 0; i < tilesAround.length; i++) {
                    if (opened.find(c => c.x == tilesAround[i].x && c.y == tilesAround[i].y) == null) {
                        this.openTile(tilesAround[i].x, tilesAround[i].y, opened)
                    }
                }
            }


        },
        verify() {
            if (this.minesLeft == 0 && this.opened + this.flags == this.totalTiles) {
                console.log("Checking ")
            }
        },
        openAll() {
            this.stopTimer()
            for (let i = 0; i < this.options.h; i++) {
                for (let j = 0; j < this.options.w; j++) {
                    this.tiles[i][j].isOpen = true
                }
            }
        }

    }
})