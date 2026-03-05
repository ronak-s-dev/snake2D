/* {GAME -- SNAKE 2D} */
/* @ -> starting position of snake;
# -> boulders in the garden;
o -> food;
. -> empty space */

const simpleGarden = `
..........o...........
...................#..
...................#..
............o......#..
..@........#####...#..
..#####............#..
...................#..
.....o..........####..
......................`;

/* Map: Garden -> Separate them based on Moving / Stationary Elements */
const levelChars = {
    "." : "empty",
    "#" : "boulder",
    "o" : Food,
    "@" : Snake
}

/* Provides a 2D Co-ordinate For Moving Elements Within The Game, 
Stationary Elements Are Identified By Array Indices */

class Level {
  constructor(garden) {
    if (!garden) return;

    let gardenRows = garden.trim().split("\n").map((ch) => [...ch]);

    this.height = gardenRows.length; //9
    this.width = gardenRows[0].length; //22

    this.startActors = [];

    this.gardenRows = gardenRows.map((row, y) => {
        return row.map((ch, x) => {
            let type = levelChars[ch];
            if(typeof type != "string"){ // Only Actors
                let pos = new Vec(x, y);
                this.startActors.push(type.create(pos, ch));
                type = "empty";
            }
            return type;
        })
    })
  }
}

/* Computes A 2D Vector Co-ordinate for Actors In The Game */
class Vec{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    plus(other){
        return new Vec(this.x + other.x, this.y + other.y);
    }

    times(factor){
        return new Vec(this.x * factor, this.y * factor);
    }
}

/* Track State of The Game On Running State */
class State{
    constructor(level, actors, status){
        this.level = level;
        this.actors = actors;
        this.status = status;
    }

    static start(level){
        return new State(level, level.startActors, "hunting");
    }

    get snake(){
        return this.actors.find(a => a.type == "snake");
    }

    get food() {
        return this.actors.filter(a => a.type == "food");
    }
}