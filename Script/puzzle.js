'use strict';
// SECTOR_1:定数群
const ORB_COLORS=5;
const [BASE_SCORE,SCORE_EXPONENT]=[100,1.5];
const ANIM_SPEED=100;
const SHORTEST_CHAIN=3;
const MAIN_BOARD = document.querySelector("#puz_board");
const DIV_PUZ_DISPLAY = document.querySelector("#puz_display");
const DIV_STAGE_SELECT = document.querySelector("#stage_select");
const DATALINK = "../Data/Stage/1.js";
const [ALT_ORB,ALT_OBJECT,ALT_FIELD] = ["□🔴🔵🟢🟡🟣","□🧱🌸","□🥬"];
// SECTOR_2:変数群
let [chain_now,chainable]=[false,false];
let chain_info={color : null,count : 0};
let chain_yx =new Array();//[i].(x | y)
let adj_list = new Array();//[i].(y | x)
//SECTOR_2.5:準const変数群
let PUZ_BOARD_BONE=new Array();
let DATA={};
// SECTOR_3:関数マニュアル
// fallable(obj_type) : 該当オブジェクトが落下物か確認
// is_adj_break(obj_type) : 該当オブジェクトがadj_breakを持つか確認
// update_cell(y,x) : 1マスだけ画面を更新
// update_display() : 関数名通り
// obj_erase(y,x,draw=false) : 指定したマスを消す。drawなら描画する。
// load_board() : [TODO] ファイルからパズルの読み込みをする
// falling_orb() : 関数名通り
// onmouce_cell(cell) : チェイン中の処理とかやってます
// chain_toggler(cell) : 関数名通り
// board_init() : 関数名通り
// startgame() : 関数名通り
const fallable = obj_type => (obj_type>0)||[-2].includes(obj_type);
const is_adj_break = obj_type => [-2].includes(obj_type);
const dest_sync = field_type => [1].includes(field_type);
const alt_text = (type,isobj) => isobj?(type<0?ALT_OBJECT[-type]:ALT_ORB[type]):ALT_FIELD[type];
const update_cell = (y,x) =>{
	const CELL=PUZ_BOARD_BONE[y][x];
	[CELL.querySelector("img.object").src,CELL.querySelector("img.field").src,
	CELL.querySelector("img.object").alt,CELL.querySelector("img.field").alt] = 
	[`Pictures/Orbs/${DATA.board.obj[y][x][0]}.svg`,`Pictures/Fields/${DATA.board.field[y][x][0]}.svg`,
	alt_text(DATA.board.obj[y][x][0],true),alt_text(DATA.board.field[y][x][0],false)];
}
const object_copy = x => JSON.parse(JSON.stringify(x));

const update_display = () => {
	for(let i=0;i<DATA.size.Height;i++)for(let j=0;j<DATA.size.Width;j++)update_cell(i,j);
	document.querySelector("#puz_info").innerText = `Score : ${DATA.target.score} Hand : ${DATA.target.hand}`;
}
const obj_erase = (y,x,isobj=true) => {
	(isobj?DATA.board.obj:DATA.board.field)[y][x] = [0,0];
	update_cell(y,x);
}
const break_obj = (y,x,ischain,isobj=true) => {
	const TARGET = isobj?DATA.board.obj[y][x]:DATA.board.field[y][x];
	if(--TARGET[1]<=0||ischain){
		if(!isobj&&TARGET[0] === 1)DATA.target.score+=BASE_SCORE;
		obj_erase(y,x,isobj);
		isobj && dest_sync(DATA.board.field[y][x][0]) && break_obj(y,x,false,false);
	}
}
const fall_obj = (yfrom,xfrom,yto,xto) => {
	const [OBJ_TO,OBJ_FROM] = [DATA.board.obj[yto][xto],DATA.board.obj[yfrom][xfrom]];
	if(OBJ_TO[0] === 0 && fallable(OBJ_FROM[0]) ){
		[OBJ_TO[0],OBJ_TO[1]]=OBJ_FROM;
		update_cell(yto,xto);
		obj_erase(yfrom,xfrom);
		return true;
	}
	else return false;
}
const falling_orb = () => {
	chainable=false;
	const FALL_TIMER = setInterval(() => {
		let refall=false;
		for(let i=DATA.size.Height-1;i>0;i--)/*性質上、下から探索したほうがいい*/{
			for(let j=0;j<DATA.size.Width;j++)refall=fall_obj(i-1,j,i,j)||refall;//C-shift
			for(let j=1;j<DATA.size.Width;j++)refall=fall_obj(i-1,j,i,j-1)||refall;//L-shift
			for(let j=0;j<DATA.size.Width-1;j++)refall=fall_obj(i-1,j,i,j+1)||refall;//R-shift
		}
		for(let i=0;i<DATA.size.Width;i++){
			if(DATA.board.obj[0][i][0] === 0){
				DATA.board.obj[0][i]=[~~(Math.random()*ORB_COLORS)+1,1];
				refall=true;
			}
		}
		if(!refall){
			clearInterval(FALL_TIMER);
			chainable=true;
		}
		update_display();
	},ANIM_SPEED);
}
const onmouce_cell = cell => {
	const [CELL_Y,CELL_X] = [cell.target.parentNode.rowIndex,cell.target.cellIndex];
	const CELL_COLOR = DATA.board.obj[CELL_Y][CELL_X][0];
	if(chain_now){
		if(Math.abs(chain_yx.at(-1).y-CELL_Y)<=1&&Math.abs(chain_yx.at(-1).x-CELL_X)<=1)/*位置チェック*/{
			if(chain_info.color === CELL_COLOR&&!chain_yx.some(e => e.x === CELL_X && e.y === CELL_Y))/*条件チェック*/{
				cell.target.querySelector("img").classList.add("chaining");
				chain_yx.push({x : CELL_X,y : CELL_Y});
				chain_info.count++;
			}
		}
	}
}
const chain_toggler = cell => {
	if(!chainable)return;
	const [CELL_Y,CELL_X] = [cell.target.parentNode.rowIndex,cell.target.cellIndex];
	const CELL_COLOR = DATA.board.obj[CELL_Y][CELL_X][0];
	if(chain_now){//チェイン終了時の処理
		chain_now=false;
		if(!(chain_info.count<SHORTEST_CHAIN)){
			DATA.target.score+=~~(chain_info.count**SCORE_EXPONENT*BASE_SCORE);
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
			adj_list.forEach(pos =>	is_adj_break(DATA.board.obj[pos.y][pos.x][0]) && break_obj(pos.y,pos.x,false));
			update_display();
			falling_orb();
		}
		chain_yx.forEach(pos => PUZ_BOARD_BONE[pos.y][pos.x].querySelector("img").classList.remove("chaining"));
		chain_info={count : 0,color : null};
		adj_list=chain_yx=[];
		if(DATA.target.hand<=0){
			alert(`ゲームオーバー！　スコアは${DATA.target.score}でした!`);
			DIV_STAGE_SELECT.style.display="block";
			DIV_PUZ_DISPLAY.style.display="none";
		}
	}else if(CELL_COLOR>0){//チェイン開始の処理
		chain_now=true;
		chain_info={count : 1,color : CELL_COLOR};
		chain_yx.push({x : CELL_X,y : CELL_Y});
		cell.target.querySelector("img").classList.add("chaining");
	}
}
const load_board = () => {
	PUZ_BOARD_BONE=new Array(DATA.size.Height).fill().map(_=>Array(DATA.size.Width));
	MAIN_BOARD.innerHTML = null;
	for (let i = 0; i < DATA.size.Height; i++) {
		const TR = document.createElement("tr");
		TR.classList.add("puz_board_tr");
		for (let j = 0; j < DATA.size.Width; j++) {
			const TD = document.createElement("td");
			TD.classList.add("inboard");
			TD.onmouseover = onmouce_cell;
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
	console.log(document.querySelector("#startbutton"));
	load_board();
	falling_orb();
	adj_list=chain_yx=[];
	update_display();
}
const startgame = () => {
	DIV_STAGE_SELECT.style.display="none";
	DIV_PUZ_DISPLAY.style.display="block";
	import(DATALINK)
	.then(x => {DATA = object_copy(x.default) ; board_init()});
};
document.querySelector("#startbutton").onclick=startgame;
//1~:オーブ
//0:無空間
//~-1:妨害ブロック

//ADJ_BREAK