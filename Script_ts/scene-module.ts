import startScene from "./start.js";
import scenePuzzle from "./puzzle.js";
const scenes : {start? : startScene ,puzzle? : scenePuzzle} = {};
scenes.start = new startScene(scenes);
scenes.puzzle = new scenePuzzle(scenes);
Object.freeze(scenes);
scenes.start.initer(false);
