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

    let gardenRows = garden
      .trim()
      .split("\n")
      .map((ch) => [...ch]);

    this.height = gardenRows.length; //9
    this.width = gardenRows[0].length; //22

    this.startActors = [];

    this.gardenRows = gardenRows.map((row, y) => {
      return row.map((ch, x) => {
        let type = levelChars[ch];
        if (typeof type != "string") {
          // Only Actors
          let pos = new Vec(x, y);
          this.startActors.push(type.create(pos, ch));
          type = "empty";
        }
        return type;
      });
    });
  }
}

/* Computes A 2D Vector Co-ordinate for Actors (Snake & Food) In The Game */
class Vec {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  plus(other) {
    return new Vec(this.x + other.x, this.y + other.y);
  }

  times(factor) {
    return new Vec(this.x * factor, this.y * factor);
  }

  getDirection() {
    if (Math.abs(this.x) > Math.abs(this.y)) {
      return this.x > 0 ? "right" : "left";
    } else {
      return this.y > 0 ? "down" : "up";
    }
  }
}

/* Track State of The Game While Running */
class State {
  constructor(level, actors, status) {
    this.level = level;
    this.actors = actors;
    this.status = status;
  }

  static start(level) {
    return new State(level, level.startActors, "hunting");
  }

  get snake() {
    return this.actors.find((a) => a.type == "snake");
  }

  get food() {
    return this.actors.filter((a) => a.type == "food");
  }
}

class Snake {
  constructor(pos, speed, direction, body) {
    this.pos = pos;
    this.speed = speed;
    this.direction = direction;
    this.body = body || [];
  }

  get type() {
    return "snake";
  }

  static create(pos) {
    return new Snake(pos.plus(new Vec(0, 0)), new Vec(0, 0), "right");
  }
}

Snake.prototype.size = new Vec(1, 1); // Size remains constant for all instances of Snake, so we store it in the prototype itself rather than an instance;

class Food {
  constructor(pos) {
    this.pos = pos;
  }

  get type() {
    return "food";
  }

  static create(pos) {
    return new Food(pos.plus(new Vec(0, 0)));
  }
}

Food.prototype.size = new Vec(1, 1); // Size remains same as the snake's head & body;

/* Map: Garden -> Separate elements based on Moving / Stationary Elements */
const levelChars = {
  ".": "empty",
  "#": "boulder",
  o: Food,
  "@": Snake,
};

/* Helper Function to Create an Element and Add Certain Attributes */
function elt(name, attrs, ...children) {
  let dom = document.createElement(name);

  for (let attr of Object.keys(attrs)) {
    dom.setAttribute(attr, attrs[attr]);
  }

  for (let child of children) {
    dom.appendChild(child);
  }

  return dom;
}

class DOMDisplay {
  constructor(parent, level) {
    this.dom = elt("div", { class: "game" }, drawGrid(level)); // The game's background grid is drawn once since it never changes;
    this.actorLayer = null; // Actors are drawn every time display is updated
    parent.appendChild(this.dom);
  }

  clear() {
    this.dom.remove();
  }
}

const scale = 20;

function drawGrid(level) {
  return elt(
    "table",
    {
      // Create Parent element
      class: "background",
      style: `width: ${level.width * scale}px`,
    },
    ...level.gardenRows.map((row) =>
      elt(
        "tr",
        {
          // Create first Child Element
          style: `height: ${scale}px`,
        },
        ...row.map((type) =>
          elt("td", {
            // Create grand Child Element
            class: type,
          }),
        ),
      ),
    ),
  );
}

/* Draw each actor by creating a separate DOM element for it */
function drawActors(actors) {
    let boxes = [];

    for (let actor of actors) {
        // Draw the actor itself (head for snake, position for food)
        let box = elt("div", {
            class: `actor ${actor.type}`
        });
        box.style.width = `${actor.size.x * scale}px`;
        box.style.height = `${actor.size.y * scale}px`;
        box.style.left = `${actor.pos.x * scale}px`;
        box.style.top = `${actor.pos.y * scale}px`;
        boxes.push(box);

        // Draw body segments if actor is the snake
        if (actor.type == "snake") {
            for (let segment of actor.body) {
                let segBox = elt("div", {
                    class: "actor snake"
                });
                segBox.style.width = `${scale}px`;
                segBox.style.height = `${scale}px`;
                segBox.style.left = `${segment.x * scale}px`;
                segBox.style.top = `${segment.y * scale}px`;
                boxes.push(segBox);
            }
        }
    }

    return elt("div", {}, ...boxes);
}

/* Show display at a given state - Remove old graphics and redraw actor in new position*/
DOMDisplay.prototype.syncState = function (state) {
  if (this.actorLayer) this.actorLayer.remove();

  this.actorLayer = drawActors(state.actors);
  this.dom.appendChild(this.actorLayer);
  this.dom.className = `game ${state.status}`;
  this.scrollSnakeIntoView(state); // The snake doesn't always fit into the view port;
};

DOMDisplay.prototype.scrollSnakeIntoView = function (state) {
  let width = this.dom.clientWidth;
  let height = this.dom.clientHeight;
  let margin = width / 3;

  //View-port
  let left = this.dom.scrollLeft,
    right = left + width;
  let top = this.dom.scrollTop,
    bottom = top + height;

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
};

Level.prototype.touches = function(pos, size, type) {
    let xStart = Math.floor(pos.x);
    let xEnd = Math.ceil(pos.x + size.x);
    let yStart = Math.floor(pos.y);
    let yEnd = Math.ceil(pos.y + size.y);

    for (let y = yStart; y < yEnd; y++) {
        for (let x = xStart; x < xEnd; x++) {
            let isOutside = x < 0 || x >= this.width || y < 0 || y >= this.height;
            let here = isOutside ? "boulder" : this.gardenRows[y][x];
            if (here == type) return true;
        }
    }

    return false;
};

State.prototype.update = function(time, keys) {
    let actors = this.actors.map((actor) => actor.update(time, this, keys));

    let newState = new State(this.level, actors, this.status);

    if (newState.status != "hunting") return newState;

    let snake = newState.snake;

    if (this.level.touches(snake.pos, snake.size, "boulder")) {
        return new State(this.level, actors, "lost");
    }

    // Self-collision check ↓
    let selfBite = snake.body.some(segment => overlap(
        { pos: snake.pos, size: snake.size },
        { pos: segment,   size: snake.size }
    ));

    if (selfBite) return new State(this.level, actors, "lost");

    for (let actor of actors) {
        if (actor != snake && overlap(actor, snake)) {
            newState = actor.collide(newState);
        }
    }

    return newState;
};

function overlap(actor1, actor2) {
    return (
        actor1.pos.x + actor1.size.x > actor2.pos.x &&
        actor1.pos.x < actor2.pos.x + actor2.size.x &&
        actor1.pos.y + actor1.size.y > actor2.pos.y &&
        actor1.pos.y < actor2.pos.y + actor2.size.y
    );
}

Food.prototype.collide = function(state){
    let filtered = state.actors.filter(a => a != this);
    let status = state.status;

    if(!filtered.some(a => a.type == "food")) status = "won";

    let snake = state.snake;
    let grownSnake = new Snake(
        snake.pos,
        snake.speed,
        snake.direction,
        snake.body.concat([snake.pos]) // ← append head position to body
    );

    let newActors = filtered.map(a => a.type == "snake" ? grownSnake : a);
    return new State(state.level, newActors, status);
}

const directionVecs = {
    "left": new Vec(-1, 0),
    "right": new Vec(1, 0),
    "up": new Vec(0, -1),
    "down": new Vec(0, 1)
};

const snakeSpeed = 3;

Snake.prototype.update = function(time, state, keys){
    let direction = this.direction;

    if(keys.ArrowLeft) direction = "left";
    if(keys.ArrowRight) direction = "right";
    if(keys.ArrowUp) direction = "up";
    if(keys.ArrowDown) direction = "down";

    let speed = directionVecs[direction].times(snakeSpeed);
    let newPos = this.pos.plus(speed.times(time));

    return new Snake(newPos, speed, direction, this.body);
}

// remains stationary, nothing to update;
Food.prototype.update = function(time, state, keys){
    return this;
}

function trackKeys(keys){
    let down = Object.create(null);

    function track(event){
        if(keys.includes(event.key)){
            down[event.key] = event.type == "keydown";
            event.preventDefault();
        }
    }

    window.addEventListener("keydown", track);
    window.addEventListener("keyup", track);

    return down;
}

const arrowKeys = trackKeys(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]);

function runAnimation(frameFunc){
    let lastTime = null;
    function frame(time){
        if(lastTime != null){
            let timeStep = Math.min(time - lastTime, 100) / 1000;
            if(frameFunc(timeStep) === false) return;
        }
        lastTime = time;
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

function runLevel(level, Display){
    let display = new Display(document.body, level);
    let state = State.start(level);

    return new Promise(resolve => {
        runAnimation(time => {
            state = state.update(time, arrowKeys);
            display.syncState(state);

            if(state.status == "hunting"){
                return true; // keep animating
            } else {
                display.clear();
                resolve(state.status); // "won" or "lost"
                return false; // stop animation
            }
        });
    });
}

async function runGame(levels, Display){
    for(let level = 0; level < levels.length;){
        let status = await runLevel(levels[level], Display);
        if(status == "won"){
            console.log("You won the game!");
            level++;
        } else {
            console.log("You lost! Restarting...");
            // level index stays the same, replays simpleLevel
        }
    }
}

let simpleLevel = new Level(simpleGarden);
//runGame([simpleLevel], DOMDisplay);