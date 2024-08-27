import START from "./start.js";
import PUZZLE from "./puzzle.js";
const scenes = {};
scenes.start = START(scenes);
scenes.puzzle = PUZZLE(scenes);
Object.freeze(scenes);
scenes.start(false);
