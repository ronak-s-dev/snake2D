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
.....o.............#..
......................`;

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

/* Computes A 2D Vector Co-ordinate for Actors (Snake & Food) In The Game */
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

    getDirection(){
        if(Math.abs(this.x) > Math.abs(this.y)){
            return this.x > 0 ? "right" : "left";
        } else {
            return this.y > 0 ? "down" : "up";
        }
    }
}

/* Track State of The Game While Running */
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

class Snake{
    constructor(pos, speed, direction){
        this.pos = pos;
        this.speed = speed;
        this.direction = direction;
    }

    get type() { return "snake"; }

    static create(pos){
        return new Snake(pos.plus(new Vec(0, 0)), new Vec(0, 0), "right");
    }
}

Snake.prototype.size = new Vec(1, 1); // Size remains constant for all instances of Snake, so we store it in the prototype itself rather than an instance;

class Food{
    constructor(pos){
        this.pos = pos;
    }

    get type() { return "food"; }

    static create(pos){
        return new Food(pos.plus(new Vec(0,0)));
    }
}

Food.prototype.size = new Vec(1, 1); // Size remains same as the snake's head & body;

/* Map: Garden -> Separate elements based on Moving / Stationary Elements */
const levelChars = {
    "." : "empty",
    "#" : "boulder",
    "o" : Food,
    "@" : Snake
}

/* Helper Function to Create an Element and Add Certain Attributes */
function elt(name, attrs, ...children){
    let dom = document.createElement(name);

    for(let attr of Object.keys(attrs)){
        dom.setAttribute(attr, attrs[attr]);
    }

    for(let child of children){
        dom.appendChild(child);
    }

    return dom;
}

class DOMDisplay{
    constructor(parent, level){
        this.dom = elt("div", {class: "game"}, drawGrid(level)); // The game's background grid is drawn once since it never changes;
        this.actorLayer = null; // Actors are drawn every time display is updated
        parent.appendChild(this.dom);
    }

    clear() { this.dom.remove(); }
}

const scale = 20;

function drawGrid(level) {
    return elt("table", { // Create Parent element
        class: "background",
        style: `width: ${level.width * scale}px`
    }, ...level.gardenRows.map(row => elt("tr", { // Create first Child Element
        style: `height: ${scale}px`
    }, ...row.map(type => elt("td", { // Create grand Child Element
        class: type
    })))))
}

/* Draw each actor by creating a separate DOM element for it */
function drawActors(actors){
    return elt("div", {}, ...actors.map(actor => {
        let box = elt("div", {
            class: `actor ${actor.type}`
        });
        box.style.width = `${actor.size.x * scale}px`;
        box.style.height = `${actor.size.y * scale}px`;
        box.style.left = `${actor.pos.x * scale}px`;
        box.style.top = `${actor.pos.y * scale}px`;
        return box;
    }))
}

/* Show display at a given state - Remove old graphics and redraw actor in new position*/
DOMDisplay.prototype.syncState = function(state){
    if(this.actorLayer) this.actorLayer.remove();

    this.actorLayer = drawActors(state.actors);
    this.dom.appendChild(this.actorLayer);
    this.dom.className = `game ${state.status}`;
    this.scrollSnakeIntoView(state); // The snake doesn't always fit into the view port;
}

DOMDisplay.prototype.scrollSnakeIntoView = function(state){
    let width = this.dom.clientWidth;
    let height = this.dom.clientHeight;
    let margin = width / 3;

    //View-port
    let left = this.dom.scrollLeft, right = left + width;
    let top = this.dom.scrollTop, bottom = top + height;

    let snake = state.snake;
    let center = snake.pos.plus(snake.size.times(0.5)).times(scale);

    if (center.x < left + margin) {
      this.dom.scrollLeft = center.x - margin;
    } else if (center.x > right - margin) {
      this.dom.scrollLeft = center.x + margin - width;
    }
    if (center.y < top + margin) {
      this.dom.scrollTop = center.y - margin;
    } else if (center.y > bottom - margin) {
      this.dom.scrollTop = center.y + margin - height;
    }
}

let simpleLevel = new Level(simpleGarden);
let display = new DOMDisplay(document.body, simpleLevel);
display.syncState(State.start(simpleLevel));