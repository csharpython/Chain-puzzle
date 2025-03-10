import dataSaver from "./dataSaver.js";
interface point {
	x: number;
	y: number;
}
/**@todo Dateオブジェクトなど、一部のオブジェクトがコピーできないのでその対策。 */
const object_copy = (obj: unknown) => JSON.parse(JSON.stringify(obj));

/**
 * Array.someのobject版です。
 */
const objectSome = <T>(obj : Record<string,T>, func : (x:T) => boolean) => Object.keys(obj).some(x => func(obj[x]));
const enum ENUM_STATUS {
	"CHAINING",
	"IDLE",
	"ANIMATION"
};
import type {Board} from "../Data/Stage/format.ts";
export default class scenePuzzle{
	// SECTOR_1:定数群
	scenes : {start?:any} = {start:undefined};
	constructor(scenes : {start?:any}){
		this.scenes = scenes;
	}
	SAVER = new dataSaver("savedata");
	ORB_COLORS = 5 as const;
	BASE_SCORE = 100 as const;
	SCORE_EXPONENT = 1.5 as const;
	ANIM_SPEED = 200 as const;
	SHORTEST_CHAIN = 3 as const;
	CONTINUE_BONUS = 5 as const;
	CONTINUE_COST = 100 as const;
	MAIN_BOARD = document.getElementById("puz_board")!;
	DIV_PUZ_DISPLAY = document.getElementById("puz_display")!;
	DIV_PUZ_INFO = document.getElementById("puz_info")!;
	DIV_TARGET_INFO = document.getElementById("target_info")!;
	ALT_ORB = "□🔴🔵🟢🟡🟣" as const;
	ALT_OBJECT = "□🧱🌸" as const;
	ALT_FIELD = "□🥬" as const;
	// SECTOR_2:変数群
	game_state: number = ENUM_STATUS.CHAINING;
	chain_color: number = -1;
	chain_yx: point[] = []; //[i].(x | y)
	//SECTOR_2.5:準const変数群
	PUZ_BOARD_BONE: HTMLElement[][] = [];
	DATA: Board = {} as Board;
	STAGE_ID: number = -1;
	// SECTOR 3 : 関数群
	endscene(err: Error | null = null, wasSuccess = false){
		this.DIV_PUZ_DISPLAY.style.display = "none";
		this.scenes.start.initer(wasSuccess, Number(this.STAGE_ID));
		if (err) throw err;
	};
	gameClear(){
		if (
			this.DATA.target.score < 0 ||
			objectSome(this.DATA.target?.obj, (x: number) => x > 0) ||
			objectSome(this.DATA.target?.field, (x: number) => x > 0)
		)
			return false;
		alert("GAME CLEAR");
		this.endscene(null, true);
		return true;
	};
	addScore(score_mult: number, base = this.BASE_SCORE){this.DATA.target.score += Math.floor(base * score_mult)};
	getType(obj: number[]){return obj[0]};
	getCellPos(cell: {target : any}):[number,number] {return [cell.target.parentNode.rowIndex, cell.target.cellIndex]};
	isnullobj(obj: number[]){return this.getType(obj) === 0;}
	fallable(obj: number[]){return this.getType(obj) > 0 || [-2].includes(this.getType(obj));}
	is_adj_break(obj: number[]){return [-2].includes(this.getType(obj));}
	dest_sync(field: number[]){return [1].includes(this.getType(field))};
	alt_text(type: number, isobj: boolean){return isobj ? (type < 0 ? this.ALT_OBJECT[-type] : this.ALT_ORB[type]) : this.ALT_FIELD[type];}
	get_img(type: number, isobj: boolean){return `<img src="Pictures/${
			isobj ? "Orbs" : "Fields"
		}/${type}.svg",width="40" height="40" alt="${this.alt_text(type, isobj)}">`;}
	update_cell = (y: number, x: number) => {
		const CELL = this.PUZ_BOARD_BONE[y][x];
		const IMGOBJ = CELL.querySelector("img.object") as HTMLImageElement;
		const IMG_FIELD = CELL.querySelector("img.field") as HTMLImageElement;
		[IMGOBJ.src, IMG_FIELD.src, IMGOBJ.alt, IMG_FIELD.alt] = [
			`Pictures/Orbs/${this.getType(this.DATA.board.obj[y][x])}.svg`,
			`Pictures/Fields/${this.getType(this.DATA.board.field[y][x])}.svg`,
			this.alt_text(this.getType(this.DATA.board.obj[y][x]), true),
			this.alt_text(this.getType(this.DATA.board.field[y][x]), false),
		];
	};
	update_display(){
		for (let i = 0; i < this.DATA.size.Height; i++)
			for (let j = 0; j < this.DATA.size.Width; j++) this.update_cell(i, j);
		this.DIV_PUZ_INFO.innerText = `Score : ${this.DATA.target.score} Hand : ${this.DATA.target.hand}`;
	};
	/** @todo 文字サイズ */
	updateTarget = () =>
		(this.DIV_TARGET_INFO.innerHTML =
			Object.keys(this.DATA.target.obj)
				.map(Number)
				.map(type => this.get_img(type, true) + "x" + String(this.DATA.target.obj[type]))
				.toString() +
			"," +
			Object.keys(this.DATA.target.field)
				.map(Number)
				.map(type => this.get_img(type, false) + "x" + String(this.DATA.target.field[type]))
				.toString());

	obj_erase(obj: unknown[]){[obj[0], obj[1]] = [0, 0]};
	break_obj(y: number, x: number, ischain: boolean, isobj = true){
		const TARGET = isobj ? this.DATA.board.obj[y][x] : this.DATA.board.field[y][x];
		const OBJTYPE = this.getType(TARGET);
		if (--TARGET[1] <= 0 || ischain) {
			if (!isobj && OBJTYPE === 1) this.addScore(1);
			const TARGETrEMAIN = this.DATA.target?.[isobj ? "obj" : "field"];
			if (TARGETrEMAIN?.[OBJTYPE] && TARGETrEMAIN[OBJTYPE] > 0) {
				TARGETrEMAIN[OBJTYPE]--;
				this.updateTarget();
			}
			this.obj_erase(TARGET);
			this.update_cell(y, x);
			isobj && this.dest_sync(this.DATA.board.field[y][x]) && this.break_obj(y, x, false, false);
		}
	};
	fall_obj(obj_from: number[], obj_to: number[]){
		if (!this.isnullobj(obj_to) || !this.fallable(obj_from)) return false;
		[obj_to[0], obj_to[1]] = obj_from;
		this.obj_erase(obj_from);
		return true;
	};
	falling_orb(){
		this.game_state = ENUM_STATUS.ANIMATION;
		const FALL_TIMER = setInterval(() => {
			let refall = false;
			for (let i = this.DATA.size.Height - 1; i > 0; i--) /*性質上、下から探索したほうがいい*/ {
				for (let j = 0; j < this.DATA.size.Width; j++)
					refall = this.fall_obj(this.DATA.board.obj[i - 1][j], this.DATA.board.obj[i][j]) || refall; //C-shift
				for (let j = 1; j < this.DATA.size.Width; j++)
					refall = this.fall_obj(this.DATA.board.obj[i - 1][j], this.DATA.board.obj[i][j - 1]) || refall; //L-shift
				for (let j = 0; j < this.DATA.size.Width - 1; j++)
					refall = this.fall_obj(this.DATA.board.obj[i - 1][j], this.DATA.board.obj[i][j + 1]) || refall; //R-shift
			}
			this.DATA.board.obj[0] = this.DATA.board.obj[0].map((x: [number,number]) =>
				this.isnullobj(x) ? ((refall = true), [~~(Math.random() * this.ORB_COLORS) + 1, 1]) : x
			);
			if (!refall) {
				clearInterval(FALL_TIMER);
				this.game_state = ENUM_STATUS.IDLE;
			}
			this.update_display();
		}, this.ANIM_SPEED);
	};
	chain_connect(cell : {target : any}){
		if (this.game_state !== ENUM_STATUS.CHAINING) return;
		const [CELL_Y, CELL_X] = this.getCellPos(cell);
		const CELL_COLOR = this.getType(this.DATA.board.obj[CELL_Y][CELL_X]);
		const CHAIN_LAST = this.chain_yx.at(-1) as point;
		if (Math.abs(CHAIN_LAST.y - CELL_Y) > 1) return;
		if (Math.abs(CHAIN_LAST.x - CELL_X) > 1) return; /*位置チェック*/
		if (this.chain_color !== CELL_COLOR) return;
		if (this.chain_yx.some(e => e.x === CELL_X && e.y === CELL_Y)) return; /*条件チェック*/
		cell.target.querySelector("img").classList.add("chaining");
		this.chain_yx.push({ x: CELL_X, y: CELL_Y });
	};
	chain_over(){
		let adj_list: point[] = [];
		if (this.chain_yx.length >= this.SHORTEST_CHAIN) {
			this.addScore(this.chain_yx.length ** this.SCORE_EXPONENT);
			this.DATA.target.hand--;
			this.chain_yx.forEach(pos => {
				this.break_obj(pos.y, pos.x, true);
				for (let dy = -1; dy <= 1; dy++) {
					const NEWY = pos.y + dy;
					for (let dx = -1; dx <= 1; dx++) {
						const NEWX = pos.x + dx;
						this.DATA.board.obj[NEWY]?.[NEWX] &&
							adj_list.every(e => e.x !== NEWX || e.y !== NEWY) &&
							adj_list.push({ y: NEWY, x: NEWX });
					}
				}
			});
			adj_list.forEach(
				pos => this.is_adj_break(this.DATA.board.obj[pos.y][pos.x]) && this.break_obj(pos.y, pos.x, false)
			);
			this.update_display();
			this.falling_orb();
		}else{
			this.game_state = ENUM_STATUS.IDLE;
		}
		if (this.gameClear()) return;
		this.chain_yx.forEach(pos => {
			const target = this.PUZ_BOARD_BONE[pos.y][pos.x].querySelector("img")!;
			target.classList.remove("chaining");
		});
		this.chain_color = -1;
		this.chain_yx = [];
		if (this.DATA.target.hand <= 0) {
			if (
				this.SAVER.data.haveCoin >= this.CONTINUE_COST &&
				confirm(`コンテニューしますか？(手数+${this.CONTINUE_BONUS})`)
			) {
				this.DATA.target.hand += this.CONTINUE_BONUS;
				this.SAVER.data.haveCoin -= this.CONTINUE_COST;
				this.SAVER.save();
				return;
			}
			alert(`ゲームオーバー！　スコアは${this.DATA.target.score}でした!`);
			this.endscene(null, false);
		}
	};
	chain_start(cell : {target : any}){
		if(this.game_state !== ENUM_STATUS.IDLE)return;
		const [CELL_Y, CELL_X] = this.getCellPos(cell);
		const CELL_COLOR = this.getType(this.DATA.board.obj[CELL_Y][CELL_X]);
		if (CELL_COLOR <= 0) return;
		this.game_state = ENUM_STATUS.CHAINING;
		this.chain_color = CELL_COLOR;
		this.chain_yx.push({ x: CELL_X, y: CELL_Y });
		cell.target.querySelector("img").classList.add("chaining");
	};
	chain_toggler(cell: any){
		switch (this.game_state) {
			case ENUM_STATUS.ANIMATION:
				return;
			case ENUM_STATUS.CHAINING:
				this.chain_over();
				break;
			case ENUM_STATUS.IDLE:
				this.chain_start(cell);
				break;
			default:
				this.endscene(TypeError(`GUARD! unknown game_state : ${this.game_state}`));
		}
	};
	load_board(){
		const [HEIGHT, WIDTH] = [this.DATA.size.Height, this.DATA.size.Width];
		this.PUZ_BOARD_BONE = new Array(HEIGHT).fill(0).map(_ => Array(WIDTH));
		this.MAIN_BOARD.innerHTML = "";
		if (HEIGHT <= 0) this.endscene(RangeError(`GUARD! Height : ${HEIGHT} isn't positive`));
		if (WIDTH <= 0) this.endscene(RangeError(`GUARD! Width : ${WIDTH} isn't positive`));
		for (let i = 0; i < HEIGHT; i++) {
			const TR = document.createElement("tr");
			TR.classList.add("puz_board_tr");
			for (let j = 0; j < WIDTH; j++) {
				const TD = document.createElement("td");
				TD.classList.add("inboard");
				TD.onmouseover = this.chain_connect.bind(this);
				TD.addEventListener("click", this.chain_toggler.bind(this));
				TR.appendChild(TD);
				TD.innerHTML = `<img src="Pictures/Orbs/0.svg",width="40" height="40" class="notouch upper object" alt=" ">
					<img src="Pictures/Fields/0.svg",width="40" height="40" class="notouch field" alt=" ">`;
				this.PUZ_BOARD_BONE[i][j] = TD;
			}
			this.MAIN_BOARD.appendChild(TR);
		}
	};
	board_init(){
		this.load_board();
		this.falling_orb();
		this.chain_yx = [];
		this.update_display();
		this.updateTarget();
	};
	startgame(StageID: string){
		console.info(`Selected Stage ID : ${StageID}`);
		const INT_ARG = Number(StageID);
		if (isNaN(INT_ARG)) this.endscene(TypeError(`GUARD! StageID ${StageID} is NaN`));
		const DATALINK = "../Data/Stage/" + INT_ARG.toString() + ".js";
		this.DIV_PUZ_DISPLAY.style.display = "block";
		import(DATALINK)
			.then(x => {
				this.DATA = object_copy(x.default);
				this.board_init();
				this.STAGE_ID = INT_ARG;
			})
			.catch(this.endscene);
	};
};

