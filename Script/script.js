// SECTOR_1:定数群
const ORB_COLORS=5;
const BASE_SCORE=100;
const ANIM_SPEED=100;
// SECTOR_2:変数群
let chain_now=false;
let chainable=false;
let chain_color=0;
let score=0;
let hand=0;
let chain_count=0;
let chain_yx=[];//[[y,x],[y,x]]
let chain_used=new Array();
let puz_board=new Array();
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
	else return false;
}
function update_display(){
	for(let i=0;i<HEIGHT;i++){
		for(let j=0;j<WIDTH;j++){
			if(puz_board[i][j][0]!=0)PUZ_BOARD_BONE[i][j].innerHTML = '<img src="Pictures/Orbs/'+puz_board[i][j][0]+'.svg" alt="'+puz_board[i][j][0]+'" width="40" height="40" class="notouch">';
			else PUZ_BOARD_BONE[i][j].innerHTML = "";
		}
	}
	document.querySelector("#puz_info").innerText = "Score : "+score+" Hand : "+hand;
}
function load_board(){
	HEIGHT=10;
	WIDTH=10;
	HAND_MAX=10;
	const MAIN_BOARD = document.querySelector("#puz_board");
	MAIN_BOARD.innerHTML = null;
	for (let i = 0; i < HEIGHT; i++) {
		let tr = document.createElement("tr");
		tr.classList.add("puz_board_tr");
		puz_board[i]=Array(WIDTH);
		PUZ_BOARD_BONE[i]=Array(WIDTH);
		chain_used[i]=Array(WIDTH).fill(false);
			for (let j = 0; j < WIDTH; j++) {
				let td = document.createElement("td");
				td.classList.add("inboard");
				tr.appendChild(td);
				PUZ_BOARD_BONE[i][j] = td;
				td.onmouseover = onmouce_cell;
				td.addEventListener('click',chain_toggler);
			}
		MAIN_BOARD.appendChild(tr);
	}
	for(let i=0;i < HEIGHT;i++){
		for(let j=0;j < WIDTH;j++){
			puz_board[i][j]=[0,0];
			if(i==5&&j!=Math.floor(WIDTH/2))puz_board[i][j][0]=-1;
		}
	}
}
function fall_obj(yfrom,xfrom,yto,xto){
	if(puz_board[yto][xto][0]==0&&fallable(puz_board[yfrom][xfrom][0])){
		puz_board[yto][xto][0]=puz_board[yfrom][xfrom][0];
		puz_board[yfrom][xfrom][0]=0;
		return true;
	}else{
		return false;
	}
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
			if(puz_board[0][i][0]==0){
				puz_board[0][i][0]=Math.floor(Math.random()*ORB_COLORS)+1;
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
	const CELL_COLOR = puz_board[CELL_Y][CELL_X][0];
	if(chain_now){
		if(Math.abs(chain_yx.at(-1)[0]-CELL_Y)<=1&&Math.abs(chain_yx.at(-1)[1]-CELL_X)<=1)/*位置チェック*/{
			if(chain_color==CELL_COLOR&&!chain_used[CELL_Y][CELL_X])/*条件チェック*/{
				cell.target.style.backgroundColor = "blue";
				chain_yx.push([CELL_Y,CELL_X]);
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
	const CELL_COLOR = puz_board[CELL_Y][CELL_X][0];
	if(chain_now){//チェイン終了時の処理
		chain_now=false;
		if(chain_count>=3){
			score+=Math.floor(Math.pow(chain_count,1.5)*BASE_SCORE)//1.5は適当
			hand--;
			chain_yx.forEach(function(value){
				puz_board[value[0]][value[1]][0]=0;
			});
			update_display();
			falling_orb();
			update_display();
		}
		chain_yx.forEach(function(value){
			PUZ_BOARD_BONE[value[0]][value[1]].style.backgroundColor = "transparent";
			chain_used[value[0]][value[1]]=false;
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
		chain_yx.push([CELL_Y,CELL_X]);
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