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

/* Map: Garden -> Human Readable Char */
const levelChars = {
    "." : "empty",
    "#" : "boulder",
    "o" : "food",
    "@" : "snake"
}

/* Convert ASCII based garden to an array of arrays with mapped character */
class Level {
  constructor(garden) {
    if (!garden) return;

    let gardenLayout = garden.trim().split("\n").map((ch) => [...ch]);

    this.height = gardenLayout.length; //9
    this.width = gardenLayout[0].length; //22
  }
}
