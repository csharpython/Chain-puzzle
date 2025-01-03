import dataSaver from "./dataSaver.js";
export default (scenes : any) => {
	// SECTOR_1:定数群
	interface point {
		x: number;
		y: number;
	}
	const SAVER = new dataSaver("savedata");
	const ORB_COLORS = 5;
	const [BASE_SCORE, SCORE_EXPONENT] = [100, 1.5];
	const ANIM_SPEED = 100;
	const SHORTEST_CHAIN = 3;
	const [CONTINUE_BONUS, CONTINUE_COST] = [5, 100];
	const MAIN_BOARD = document.getElementById("puz_board")!;
	const DIV_PUZ_DISPLAY = document.getElementById("puz_display")!;
	const DIV_PUZ_INFO = document.getElementById("puz_info")!;
	const DIV_TARGET_INFO = document.getElementById("target_info")!;
	const [ALT_ORB, ALT_OBJECT, ALT_FIELD] = ["□🔴🔵🟢🟡🟣", "□🧱🌸", "□🥬"];
	const ENUM_STATUS = Object.freeze({ CHAINING: 0, IDLE: 1, ANIMATION: 2 });
	// SECTOR_2:変数群
	let game_state: number = ENUM_STATUS.CHAINING;
	let chain_color: number = -1;
	let chain_yx: point[] = []; //[i].(x | y)
	//SECTOR_2.5:準const変数群
	let PUZ_BOARD_BONE: HTMLElement[][] = [];
	let DATA: {[x:string] : any} = {};
	let STAGE_ID: number = -1;
	// SECTOR 3 : 関数群
	/**@todo Dateオブジェクトなど、一部のオブジェクトがコピーできないのでその対策。 */
	const object_copy = (obj: any) => JSON.parse(JSON.stringify(obj));
	/**
	 * Array.someのobject版です。
	 */
	const objectSome = (obj : any, func : any) => Object.keys(obj).some(x => func(obj[x]));

	const endscene = (err: Error | null = null, wasSuccess = false) => {
		DIV_PUZ_DISPLAY.style.display = "none";
		scenes.start(wasSuccess, Number(STAGE_ID));
		if (err) throw err;
	};
	const gameClear = () => {
		if (
			DATA.target.score < 0 ||
			objectSome(DATA.target?.obj, (x: number) => x > 0) ||
			objectSome(DATA.target?.field, (x: number) => x > 0)
		)
			return false;
		alert("GAME CLEAR");
		endscene(null, true);
		return true;
	};
	const addScore = (score_mult: number, base = BASE_SCORE) =>
		(DATA.target.score += Math.floor(base * score_mult));
	const getType = (obj: any[]) => obj[0];
	const getCellPos = (cell: {[x:string] : any}) => [cell.target.parentNode.rowIndex, cell.target.cellIndex];
	const isnullobj = (obj: any[]) => getType(obj) === 0;
	const fallable = (obj: any[]) => getType(obj) > 0 || [-2].includes(getType(obj));
	const is_adj_break = (obj: any[]) => [-2].includes(getType(obj));
	const dest_sync = (field: any[]) => [1].includes(getType(field));
	const alt_text = (type: number, isobj: boolean) =>
		isobj ? (type < 0 ? ALT_OBJECT[-type] : ALT_ORB[type]) : ALT_FIELD[type];
	const get_img = (type: number, isobj: boolean) =>
		`<img src="Pictures/${
			isobj ? "Orbs" : "Fields"
		}/${type}.svg",width="40" height="40" alt="${alt_text(type, isobj)}">`;
	const update_cell = (y: number, x: number) => {
		const CELL = PUZ_BOARD_BONE[y][x];
		const IMGOBJ = CELL.querySelector("img.object") as HTMLImageElement;
		const IMG_FIELD = CELL.querySelector("img.field") as HTMLImageElement;
		[IMGOBJ.src, IMG_FIELD.src, IMGOBJ.alt, IMG_FIELD.alt] = [
			`Pictures/Orbs/${getType(DATA.board.obj[y][x])}.svg`,
			`Pictures/Fields/${getType(DATA.board.field[y][x])}.svg`,
			alt_text(getType(DATA.board.obj[y][x]), true),
			alt_text(getType(DATA.board.field[y][x]), false),
		];
	};
	const update_display = () => {
		for (let i = 0; i < DATA.size.Height; i++)
			for (let j = 0; j < DATA.size.Width; j++) update_cell(i, j);
		DIV_PUZ_INFO.innerText = `Score : ${DATA.target.score} Hand : ${DATA.target.hand}`;
	};
	/** @todo 文字サイズ */
	const updateTarget = () =>
		(DIV_TARGET_INFO.innerHTML =
			Object.keys(DATA.target.obj)
				.map(Number)
				.map(type => get_img(type, true) + "x" + String(DATA.target.obj[type]))
				.toString() +
			"," +
			Object.keys(DATA.target.field)
				.map(Number)
				.map(type => get_img(type, false) + "x" + String(DATA.target.field[type]))
				.toString());

	const obj_erase = (obj: any[]) => ([obj[0], obj[1]] = [0, 0]);
	const break_obj = (y: number, x: number, ischain: boolean, isobj = true) => {
		const TARGET = isobj ? DATA.board.obj[y][x] : DATA.board.field[y][x];
		const OBJTYPE = getType(TARGET);
		if (--TARGET[1] <= 0 || ischain) {
			if (!isobj && OBJTYPE === 1) addScore(1);
			const TARGETrEMAIN = DATA.target?.[isobj ? "obj" : "field"];
			if (TARGETrEMAIN?.[OBJTYPE] && TARGETrEMAIN[OBJTYPE] > 0) {
				TARGETrEMAIN[OBJTYPE]--;
				updateTarget();
			}
			obj_erase(TARGET);
			update_cell(y, x);
			isobj && dest_sync(DATA.board.field[y][x]) && break_obj(y, x, false, false);
		}
	};
	const fall_obj = <T>(obj_from: T[], obj_to: T[]) => {
		if (!isnullobj(obj_to) || !fallable(obj_from)) return false;
		[obj_to[0], obj_to[1]] = obj_from;
		obj_erase(obj_from);
		return true;
	};
	const falling_orb = () => {
		game_state = ENUM_STATUS.ANIMATION;
		const FALL_TIMER = setInterval(() => {
			let refall = false;
			for (let i = DATA.size.Height - 1; i > 0; i--) /*性質上、下から探索したほうがいい*/ {
				for (let j = 0; j < DATA.size.Width; j++)
					refall = fall_obj(DATA.board.obj[i - 1][j], DATA.board.obj[i][j]) || refall; //C-shift
				for (let j = 1; j < DATA.size.Width; j++)
					refall = fall_obj(DATA.board.obj[i - 1][j], DATA.board.obj[i][j - 1]) || refall; //L-shift
				for (let j = 0; j < DATA.size.Width - 1; j++)
					refall = fall_obj(DATA.board.obj[i - 1][j], DATA.board.obj[i][j + 1]) || refall; //R-shift
			}
			DATA.board.obj[0] = DATA.board.obj[0].map((x: any[]) =>
				isnullobj(x) ? ((refall = true), [~~(Math.random() * ORB_COLORS) + 1, 1]) : x
			);
			if (!refall) {
				clearInterval(FALL_TIMER);
				game_state = ENUM_STATUS.IDLE;
			}
			update_display();
		}, ANIM_SPEED);
	};
	const chain_connect = (cell : {[x:string] : any}) => {
		if (game_state !== ENUM_STATUS.CHAINING) return;
		const [CELL_Y, CELL_X] = getCellPos(cell);
		const CELL_COLOR = getType(DATA.board.obj[CELL_Y][CELL_X]);
		const CHAIN_LAST = chain_yx.at(-1) as point;
		if (Math.abs(CHAIN_LAST.y - CELL_Y) > 1) return;
		if (Math.abs(CHAIN_LAST.x - CELL_X) > 1) return; /*位置チェック*/
		if (chain_color !== CELL_COLOR) return;
		if (chain_yx.some(e => e.x === CELL_X && e.y === CELL_Y)) return; /*条件チェック*/
		cell.target.querySelector("img").classList.add("chaining");
		chain_yx.push({ x: CELL_X, y: CELL_Y });
	};
	const chain_over = () => {
		let adj_list: point[] = [];
		if (chain_yx.length >= SHORTEST_CHAIN) {
			addScore(chain_yx.length ** SCORE_EXPONENT);
			DATA.target.hand--;
			chain_yx.forEach(pos => {
				break_obj(pos.y, pos.x, true);
				for (let dy = -1; dy <= 1; dy++) {
					const NEWY = pos.y + dy;
					for (let dx = -1; dx <= 1; dx++) {
						const NEWX = pos.x + dx;
						DATA.board.obj[NEWY]?.[NEWX] &&
							adj_list.every(e => e.x !== NEWX || e.y !== NEWY) &&
							adj_list.push({ y: NEWY, x: NEWX });
					}
				}
			});
			adj_list.forEach(
				pos => is_adj_break(DATA.board.obj[pos.y][pos.x]) && break_obj(pos.y, pos.x, false)
			);
			update_display();
			falling_orb();
		}
		if (gameClear()) return;
		game_state = ENUM_STATUS.IDLE;
		chain_yx.forEach(pos => {
			const target = PUZ_BOARD_BONE[pos.y][pos.x].querySelector("img")!;
			target.classList.remove("chaining");
		});
		chain_color = -1;
		chain_yx = [];
		if (DATA.target.hand <= 0) {
			if (
				SAVER.getData(["haveCoin"]) >= CONTINUE_COST &&
				confirm(`コンテニューしますか？(手数+${CONTINUE_BONUS})`)
			) {
				DATA.target.hand += CONTINUE_BONUS;
				SAVER.setData(["haveCoin"],SAVER.getData(["haveCoin"])-CONTINUE_COST);
				return;
			}
			alert(`ゲームオーバー！　スコアは${DATA.target.score}でした!`);
			endscene(null, false);
		}
	};
	const chain_start = (cell : {[x:string] : any}) => {
		const [CELL_Y, CELL_X] = getCellPos(cell);
		const CELL_COLOR = getType(DATA.board.obj[CELL_Y][CELL_X]);
		if (CELL_COLOR <= 0) return;
		game_state = ENUM_STATUS.CHAINING;
		chain_color = CELL_COLOR;
		chain_yx.push({ x: CELL_X, y: CELL_Y });
		cell.target.querySelector("img").classList.add("chaining");
	};
	const chain_toggler = (cell: any) => {
		switch (game_state) {
			case ENUM_STATUS.ANIMATION:
				return;
			case ENUM_STATUS.CHAINING:
				chain_over();
				break;
			case ENUM_STATUS.IDLE:
				chain_start(cell);
				break;
			default:
				endscene(TypeError(`GUARD! unknown game_state : ${game_state}`));
		}
	};
	const load_board = () => {
		const [HEIGHT, WIDTH] = [DATA.size.Height, DATA.size.Width];
		PUZ_BOARD_BONE = new Array(HEIGHT).fill(0).map(_ => Array(WIDTH));
		MAIN_BOARD.innerHTML = "";
		if (HEIGHT <= 0) endscene(RangeError(`GUARD! Height : ${HEIGHT} isn't positive`));
		if (WIDTH <= 0) endscene(RangeError(`GUARD! Width : ${WIDTH} isn't positive`));
		for (let i = 0; i < HEIGHT; i++) {
			const TR = document.createElement("tr");
			TR.classList.add("puz_board_tr");
			for (let j = 0; j < WIDTH; j++) {
				const TD = document.createElement("td");
				TD.classList.add("inboard");
				TD.onmouseover = chain_connect;
				TD.addEventListener("click", chain_toggler);
				TR.appendChild(TD);
				TD.innerHTML = `<img src="Pictures/Orbs/0.svg",width="40" height="40" class="notouch upper object" alt=" ">
					<img src="Pictures/Fields/0.svg",width="40" height="40" class="notouch field" alt=" ">`;
				PUZ_BOARD_BONE[i][j] = TD;
			}
			MAIN_BOARD.appendChild(TR);
		}
	};
	const board_init = () => {
		load_board();
		falling_orb();
		chain_yx = [];
		update_display();
		updateTarget();
	};
	const startgame = (StageID: string) => {
		console.info(`Selected Stage ID : ${StageID}`);
		const INT_ARG = Number(StageID);
		if (isNaN(INT_ARG)) endscene(TypeError(`GUARD! StageID ${StageID} is NaN`));
		const DATALINK = "../Data/Stage/" + INT_ARG.toString() + ".js";
		DIV_PUZ_DISPLAY.style.display = "block";
		import(DATALINK)
			.then(x => {
				DATA = object_copy(x.default);
				board_init();
				STAGE_ID = INT_ARG;
			})
			.catch(endscene);
	};
	return startgame;
};

