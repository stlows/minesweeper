new Vue({
    el: "#app",
    data: {
        title: "Minesweeper",
        options: {
            w: 30,
            h: 16,
            mines: 50,
            lives: 3
        },
        tiles: [],
        lives: 0,
    },
    created(){
        this.newGame()
    },
    computed: {
        flags(){
            return this.tiles.flat().filter(t => t.isFlag).length
        },
        opened(){
            return this.tiles.flat().filter(t => t.isOpen).length
        },
    },
    methods:{
        newGame(){
            this.tiles = []
            this.lives=this.options.lives
            for(let i = 0; i < this.options.h; i++){
                let row = []
                for(let j = 0 ; j < this.options.w; j++){
                    row.push({
                        x:j, y:i, isBomb: false, isFlag: false, isOpen:false, bombs: 0
                    })
                }
                this.tiles.push(row)
            }

            let placed = 0
            while( placed < this.options.mines){
                let y = Math.floor(Math.random()  * this.options.h)
                let x = Math.floor(Math.random() * this.options.w)
                if(!this.tiles[y][x].isBomb){
                    this.tiles[y][x].isBomb = true
                    placed++
                }
            }
            for(let i = 0; i < this.options.h; i++){
                for(let j = 0 ; j < this.options.w; j++){
                    if(!this.tiles[i][j].isBomb){
                        this.tiles[i][j].bombs = this.bombAround(j, i)
                    }
                }
            }

        },
        bombAround(x, y){
            let bombs = 0
            let tilesAround = this.tilesAround(x, y)
            for(let i = 0; i < tilesAround.length; i++){
                if(this.tiles[tilesAround[i].y][tilesAround[i].x].isBomb){
                    bombs++
                }
            }
            return bombs
        },
        tilesAround(x, y){
            let tiles = []
            if(x > 0){ tiles.push({y, x: x-1}) }
            if(y > 0){ tiles.push({y: y-1, x}) }
            if(x < this.options.w - 1){ tiles.push({y, x: x+1}) }
            if(y < this.options.h - 1){ tiles.push({y: y+1, x: x}) }
            if(x > 0 && y > 0){ tiles.push({y: y-1, x: x-1}) }
            if(x > 0 && y < this.options.h - 1){ tiles.push({y: y+1, x: x-1}) }
            if(x < this.options.w - 1 && y > 0){ tiles.push({y: y-1, x: x+1}) }
            if(x < this.options.w - 1 && y < this.options.h - 1){ tiles.push({y: y+1, x: x+1}) }
            return tiles;
        },
        leftClick(x, y){
            this.openTile(x,y, [])
        },
        rightClick(x, y){
            if(!this.tiles[y][x].isOpen){
                this.tiles[y][x].isFlag = !this.tiles[y][x].isFlag
            }
        },
        openTile(x, y, opened){
            if(this.tiles[y][x].isBomb){
                console.log("You exploded !")
                this.lives--
                return
            }
            this.tiles[y][x].isOpen = true
            opened.push({x, y})
            if(this.tiles[y][x].bombs == 0){
                let tilesAround = this.tilesAround(x, y)
                for(let i = 0; i < tilesAround.length; i++){
                    if(opened.find(c => c.x == tilesAround[i].x && c.y == tilesAround[i].y) == null){
                        this.openTile(tilesAround[i].x,tilesAround[i].y, opened )
                    }
                }
            }
            

        }
        
    }
})