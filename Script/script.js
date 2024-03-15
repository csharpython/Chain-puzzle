// SECTOR_1:定数群
const ORB_COLORS=5;
const BASE_SCORE=100;
const ANIM_SPEED=100;
const SHORTEST_CHAIN=3;
const SCORE_EXPONENT=1.5;
const MAIN_BOARD = document.querySelector("#puz_board");
// SECTOR_2:変数群
let chain_now=false;
let chainable=false;
let chain_color=0;
let score=0;
let hand=0;
let chain_count=0;
let chain_yx=new Array();//[i].(y | x);
let adj_list_bool=new Array();
let adj_list=new Array();//[i].(y | x);
let chain_used=new Array();
let puz_board=new Array();// [y][x].(type | power)
//SECTOR_2.5:準const変数群
let PUZ_BOARD_BONE=new Array();
let HAND_MAX=0;
let HEIGHT=0;
let WIDTH=0;
// SECTOR_3:関数マニュアル
//fallable(obj_type) : 該当オブジェクトが落下物か確認
// load_board() : [TODO] ファイルからパズルの読み込みをする
// update_display() : 関数名通り
// falling_orb() : 関数名通り
	// fall_orb_seed() : オーブを落下(1マス分)
// onmouce_cell(cell) : チェイン中の処理とかやってます
// chain_toggler(cell) : 関数名通り
// board_init() : 関数名通り
function fallable(obj_type){
	if(obj_type>0)return true;
	else if(obj_type==-2) return true;
	else return false;
}
function is_adj_break(obj_type){
	if(obj_type==-2)return true;
	else return false;
}
function update_display(){
	for(let i=0;i<HEIGHT;i++){
		for(let j=0;j<WIDTH;j++){
			if(puz_board[i][j].type!=0)PUZ_BOARD_BONE[i][j].innerHTML = 
				'<img src="Pictures/Orbs/'+puz_board[i][j].type+
				'" width="40" height="40" class="notouch">';
			else PUZ_BOARD_BONE[i][j].innerHTML = "";
		}
	}
	document.querySelector("#puz_info").innerText = "Score : "+score+" Hand : "+hand;
}
function load_board(){
	HEIGHT=10;
	WIDTH=10;
	HAND_MAX=10;
	puz_board=new Array(HEIGHT).fill().map(_=>Array(WIDTH).fill().map(_=>({type : 0,power : 1})));
	PUZ_BOARD_BONE=new Array(HEIGHT).fill().map(_=>Array(WIDTH));
	adj_list_bool=new Array(HEIGHT).fill().map(_=>Array(WIDTH).fill(false));
	chain_used=new Array(HEIGHT).fill().map(_=>Array(WIDTH).fill(false));
	MAIN_BOARD.innerHTML = null;
	for (let i = 0; i < HEIGHT; i++) {
		const TR = document.createElement("tr");
		TR.classList.add("puz_board_tr");
		for (let j = 0; j < WIDTH; j++) {
			const TD = document.createElement("td");
			TD.classList.add("inboard");
			TD.onmouseover = onmouce_cell;
			TD.addEventListener('click',chain_toggler);
			TR.appendChild(TD);
			PUZ_BOARD_BONE[i][j] = TD;
		}
		MAIN_BOARD.appendChild(TR);
	}
	for(let i=0;i < HEIGHT;i++){
		for(let j=0;j < WIDTH;j++){
			if(i==5){
				puz_board[i][j].type=-(j%2)-1;
			}else if(i>6){
				puz_board[i][j].type=-2;
			}
		}
	}
}
function break_obj(y,x,ischain){
	puz_board[y][x].power--;
	if(puz_board[y][x].power<=0||ischain){
		puz_board[y][x].type=puz_board[y][x].power=0;
	}
}
function fall_obj(yfrom,xfrom,yto,xto){
	if(puz_board[yto][xto].type==0&&fallable(puz_board[yfrom][xfrom].type)){
		puz_board[yto][xto].type=puz_board[yfrom][xfrom].type;
		puz_board[yfrom][xfrom].type=0;
		return true;
	}
	else return false;
}
function falling_orb(){
	chainable=false;
	let fallseedtimer = null;
	function fall_orb_seed(){
		let refall=false;
		for(let i=HEIGHT-1;i>0;i--)/*性質上、下から探索したほうがいい*/{
			for(let j=0;j<WIDTH;j++)refall=fall_obj(i-1,j,i,j)||refall;//C-shift
			for(let j=1;j<WIDTH;j++)refall=fall_obj(i-1,j,i,j-1)||refall;//L-shift
			for(let j=0;j<WIDTH-1;j++)refall=fall_obj(i-1,j,i,j+1)||refall;//R-shift
		}
		for(let i=0;i<WIDTH;i++){
			if(puz_board[0][i].type==0){
				puz_board[0][i].type=Math.floor(Math.random()*ORB_COLORS)+1;
				puz_board[0][i].power=1;
				refall=true;
			}
		}
		if(!refall){
			clearInterval(fallseedtimer);
			chainable=true;
		}
		update_display();
	}
	fallseedtimer = setInterval(fall_orb_seed,ANIM_SPEED);
}
function onmouce_cell(cell){
	const CELL_Y = cell.target.parentNode.rowIndex;
	const CELL_X = cell.target.cellIndex;
	const CELL_COLOR = puz_board[CELL_Y][CELL_X].type;
	if(chain_now){
		if(Math.abs(chain_yx.at(-1).y-CELL_Y)<=1&&Math.abs(chain_yx.at(-1).x-CELL_X)<=1)/*位置チェック*/{
			if(chain_color==CELL_COLOR&&!chain_used[CELL_Y][CELL_X])/*条件チェック*/{
				cell.target.style.backgroundColor = "blue";
				chain_yx.push({
					x : CELL_X,
					y : CELL_Y
				});
				chain_used[CELL_Y][CELL_X]=true;
				chain_count++;
			}
		}
	}
}
function chain_toggler(cell){
	if(!chainable)return;
	const CELL_Y = cell.target.parentNode.rowIndex;
	const CELL_X = cell.target.cellIndex;
	const CELL_COLOR = puz_board[CELL_Y][CELL_X].type;
	if(chain_now){//チェイン終了時の処理
		chain_now=false;
		if(!(chain_count<SHORTEST_CHAIN)){
			adj_list=[];
			score+=Math.floor(Math.pow(chain_count,SCORE_EXPONENT)*BASE_SCORE);
			hand--;
			chain_yx.forEach(function(pos){
				break_obj(pos.y,pos.x,true);
				for(let dy=-1;dy<=1;dy++){
					const NEWPOS_Y=pos.y+dy;
					for(let dx=-1;dx<=1;dx++){
						const NEWPOS_X=pos.x+dx;
						if(NEWPOS_Y<0||NEWPOS_Y>=HEIGHT||NEWPOS_X<0||NEWPOS_X>=WIDTH)continue;
						if(!(chain_used[NEWPOS_Y][NEWPOS_X]||adj_list_bool[NEWPOS_Y][NEWPOS_X])){
							adj_list.push({y : NEWPOS_Y,x : NEWPOS_X});
							adj_list_bool[NEWPOS_Y][NEWPOS_X]=true;
						}
					}
				}
			});
			adj_list.forEach(function(pos){
				if(is_adj_break(puz_board[pos.y][pos.x].type)){
					break_obj(pos.y,pos.x,false);
				}
				adj_list_bool[pos.y][pos.x]=false;
			});
			update_display();
			falling_orb();
			update_display();
		}
		chain_yx.forEach(function(pos){
			PUZ_BOARD_BONE[pos.y][pos.x].style.backgroundColor = "transparent";
			chain_used[pos.y][pos.x]=false;
		});
		chain_count=0;
		chain_color=null;
		chain_yx=[];
		if(hand<=0){
			alert("ゲームオーバー！　スコアは"+score+"でした！");
			board_init();
		}
	}else if(CELL_COLOR>0){//チェイン開始の処理
		chain_now=true;
		chain_color=CELL_COLOR;
		chain_count=1;
		chain_used[CELL_Y][CELL_X]=true;
		console.log(CELL_X,CELL_Y);
		chain_yx.push({
			x : CELL_X,
			y : CELL_Y
		});
		cell.target.style.backgroundColor = "blue";
	}
}
function board_init(){//この関数はhttps://bubudoufu.com/sudoku/ を参考に作成
	load_board();
	falling_orb();
	score=0;
	hand=HAND_MAX;
	update_display();
}
board_init();
//1~:オーブ
//0:無空間
//~-1:妨害ブロック

//ADJ_BREAK