import START from "./start.js";
import PUZZLE from "./puzzle.js";
const scenes : {start? : Function ,puzzle? : Function} = {};
scenes.start = START(scenes);
scenes.puzzle = PUZZLE(scenes);
Object.freeze(scenes);
scenes.start(false);
