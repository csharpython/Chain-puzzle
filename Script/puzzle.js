export default () => {
	// SECTOR_1:定数群
	const ORB_COLORS=5;
	const [BASE_SCORE,SCORE_EXPONENT]=[100,1.5];
	const ANIM_SPEED=100;
	const SHORTEST_CHAIN=3;
	const MAIN_BOARD = document.getElementById('puz_board');
	const DIV_PUZ_DISPLAY = document.getElementById('puz_display');
	const [ALT_ORB,ALT_OBJECT,ALT_FIELD] = ["□🔴🔵🟢🟡🟣","□🧱🌸","□🥬"];
	// SECTOR_2:変数群
	let [chain_now,chainable]=[false,false];
	let chain_color=null;
	let chain_yx =new Array();//[i].(x | y)
	let adj_list = new Array();//[i].(y | x)
	//SECTOR_2.5:準const変数群
	let PUZ_BOARD_BONE=new Array();
	let DATA={};
	// SECTOR_3:関数マニュアル
	// onmouce_cell(cell) : チェイン中の処理とかやってます
	const endscene = () => {
		DIV_PUZ_DISPLAY.style.display="none";
		document.getElementById('move_START').onclick();
	}
	const getType = obj => obj[0];
	const isnullobj = obj => getType(obj) === 0;
	const fallable = obj => (getType(obj)>0)||[-2].includes(getType(obj));
	const is_adj_break = obj => [-2].includes(getType(obj));
	const dest_sync = field => [1].includes(getType(field));
	const alt_text = (type,isobj) => isobj?(type<0?ALT_OBJECT[-type]:ALT_ORB[type]):ALT_FIELD[type];
	const update_cell = (y,x) =>{
		const CELL=PUZ_BOARD_BONE[y][x];
		[CELL.querySelector("img.object").src,CELL.querySelector("img.field").src,
		CELL.querySelector("img.object").alt,CELL.querySelector("img.field").alt] = 
		[`Pictures/Orbs/${getType(DATA.board.obj[y][x])}.svg`,`Pictures/Fields/${getType(DATA.board.field[y][x])}.svg`,
		alt_text(getType(DATA.board.obj[y][x]),true),alt_text(getType(DATA.board.field[y][x]),false)];
	}
	const object_copy = x => JSON.parse(JSON.stringify(x));
	const update_display = () => {
		for(let i=0;i<DATA.size.Height;i++)for(let j=0;j<DATA.size.Width;j++)update_cell(i,j);
		document.getElementById('puz_info').innerText = `Score : ${DATA.target.score} Hand : ${DATA.target.hand}`;
	}
	const obj_erase = obj => [obj[0],obj[1]] = [0,0];
	const break_obj = (y,x,ischain,isobj=true) => {
		const TARGET = isobj?DATA.board.obj[y][x]:DATA.board.field[y][x];
		if(--TARGET[1]<=0||ischain){
			if(!isobj&&getType(TARGET) === 1)DATA.target.score+=BASE_SCORE;
			obj_erase(TARGET);
			update_cell(y,x);
			isobj && dest_sync(DATA.board.field[y][x]) && break_obj(y,x,false,false);
		}
	}
	const fall_obj = (obj_from,obj_to) => {
		if(isnullobj(obj_to) && fallable(obj_from)){
			[obj_to[0],obj_to[1]]=obj_from;
			obj_erase(obj_from);
			return true;
		}
		else return false;
	}
	const falling_orb = () => {
		chainable=false;
		const FALL_TIMER = setInterval(() => {
			let refall=false;
			for(let i=DATA.size.Height-1;i>0;i--)/*性質上、下から探索したほうがいい*/{
				for(let j=0;j<DATA.size.Width;j++)refall=fall_obj(DATA.board.obj[i-1][j],DATA.board.obj[i][j])||refall;//C-shift
				for(let j=1;j<DATA.size.Width;j++)refall=fall_obj(DATA.board.obj[i-1][j],DATA.board.obj[i][j-1])||refall;//L-shift
				for(let j=0;j<DATA.size.Width-1;j++)refall=fall_obj(DATA.board.obj[i-1][j],DATA.board.obj[i][j+1])||refall;//R-shift
			}
			DATA.board.obj[0] = DATA.board.obj[0].map(x => isnullobj(x)?(refall = true , [~~(Math.random()*ORB_COLORS)+1,1]):x);
			if(!refall){
				clearInterval(FALL_TIMER);
				chainable=true;
			}
			update_display();
		},ANIM_SPEED);
	}
	const chain_connect = cell => {
		if(!chain_now) return;
		const [CELL_Y,CELL_X] = [cell.target.parentNode.rowIndex,cell.target.cellIndex];
		const CELL_COLOR = getType(DATA.board.obj[CELL_Y][CELL_X]);
		if(!(Math.abs(chain_yx.at(-1).y-CELL_Y) <= 1 && Math.abs(chain_yx.at(-1).x-CELL_X)<=1)) return; /*位置チェック*/
		if(chain_color !== CELL_COLOR || chain_yx.some(e => e.x === CELL_X && e.y === CELL_Y)) return;/*条件チェック*/
		cell.target.querySelector("img").classList.add("chaining");
		chain_yx.push({x : CELL_X,y : CELL_Y});
	}
	const chain_toggler = cell => {
		if(!chainable)return;
		const [CELL_Y,CELL_X] = [cell.target.parentNode.rowIndex,cell.target.cellIndex];
		const CELL_COLOR = getType(DATA.board.obj[CELL_Y][CELL_X]);
		if(chain_now){//チェイン終了時の処理
			chain_now=false;
			if(!(chain_yx.length<SHORTEST_CHAIN)){
				DATA.target.score += ~~(chain_yx.length**SCORE_EXPONENT*BASE_SCORE);
				DATA.target.hand--;
				chain_yx.forEach(pos => {
					break_obj(pos.y,pos.x,true);
					for(let dy=-1;dy<=1;dy++){
						const NEWY=pos.y+dy;
						for(let dx=-1;dx<=1;dx++){
							const NEWX=pos.x+dx;
							DATA.board.obj[NEWY]?.[NEWX] && (adj_list.some(e => e.x === NEWX && e.y === NEWY) || adj_list.push({y : NEWY,x : NEWX}));
						}
					}
				});
				adj_list.forEach(pos =>	is_adj_break(DATA.board.obj[pos.y][pos.x]) && break_obj(pos.y,pos.x,false));
				update_display();
				falling_orb();
			}
			chain_yx.forEach(pos => PUZ_BOARD_BONE[pos.y][pos.x].querySelector("img").classList.remove("chaining"));
			chain_color = null;
			adj_list = chain_yx = [];
			if(DATA.target.hand <= 0){
				alert(`ゲームオーバー！　スコアは${DATA.target.score}でした!`);
				endscene();
			}
		}else if(CELL_COLOR > 0){//チェイン開始の処理
			chain_now = true;
			chain_color = CELL_COLOR;
			chain_yx.push({x : CELL_X,y : CELL_Y});
			cell.target.querySelector("img").classList.add("chaining");
		}
	}
	const load_board = () => {
		const [HEIGHT,WIDTH] = [DATA.size.Height,DATA.size.Width];
		PUZ_BOARD_BONE=new Array(HEIGHT).fill().map(_=>Array(WIDTH));
		MAIN_BOARD.innerHTML = null;
		if(HEIGHT <= 0){endscene(); throw RangeError(`GUARD! Height : ${HEIGHT} isn't positive`);}
		if(WIDTH <= 0){endscene();throw RangeError(`GUARD! Height : ${WIDTH} isn't positive`);}
		for (let i = 0; i < HEIGHT; i++) {
			const TR = document.createElement("tr");
			TR.classList.add("puz_board_tr");
			for (let j = 0; j < WIDTH; j++) {
				const TD = document.createElement("td");
				TD.classList.add("inboard");
				TD.onmouseover = chain_connect;
				TD.addEventListener('click',chain_toggler);
				TR.appendChild(TD);
				TD.innerHTML = `<img src="Pictures/Orbs/0.svg",width="40" height="40" class="notouch upper object" alt=" ">
					<img src="Pictures/Fields/0.svg",width="40" height="40" class="notouch field" alt=" ">`;
				PUZ_BOARD_BONE[i][j] = TD;
			}
			MAIN_BOARD.appendChild(TR);
		}
	}
	const board_init = () => {
		load_board();
		falling_orb();
		adj_list=chain_yx=[];
		update_display();
	}
	const startgame = () => {
		const StageID = document.getElementById('StageLink').value;
		if(isNaN(StageID)){
			endscene();
			throw TypeError(`GUARD! StageID ${StageID} is NaN`);
		}
		const DATALINK = "../Data/Stage/"+StageID+".js";
		DIV_PUZ_DISPLAY.style.display="block";
		import(DATALINK)
		.then(x => {DATA = object_copy(x.default) ; board_init()}).catch(x => {endscene();throw x});
	};
	document.getElementById('move_GAME').onclick=startgame;
}