// SECTOR_1:定数群
const HEIGHT=10;
const WIDTH=10;
const ORB_COLORS=5;
const BASE_SCORE=100;
const HAND_MAX=20;
// SECTOR_2:変数群
// event_target : EventListener内で使用
let chain_now=false;
let chain_color=0;
let score=0;
let hand=0;
let chain_count=0;
let chain_yx=[];//[[y,x],[y,x]]
let chain_used=new Array(HEIGHT);
let puz_board=new Array(HEIGHT);
let puz_board_bone=new Array(HEIGHT);//準const
// SECTOR_3:関数マニュアル
// update_display() : 関数名通り
// falling_orb() : 関数名通り
// onmouce_cell(cell) : チェイン中の処理とかやってます
// onleave_cell(cell) : 現在未使用
// chain_toggler(cell) : 関数名通り
// board_init() : 関数名通り
function update_display(){
	for(let i=0;i<HEIGHT;i++){
		for(let j=0;j<WIDTH;j++){
			puz_board_bone[i][j].innerText = puz_board[i][j];
			if(puz_board[i][j]==0)puz_board_bone[i][j].innerText = "";
		}
	}
	document.querySelector("#puz_info").innerText = "Score : "+score+" Hand : "+hand;
}function falling_orb(){
	let refall=true;
	while(refall){
		refall=false;
		for(let i=HEIGHT-1;i>0;i--)/*性質上、下から探索したほうがいい*/{
			for(let j=0;j<WIDTH;j++){
				if(puz_board[i][j]==0&&puz_board[i-1][j]!=0){
					puz_board[i][j]=puz_board[i-1][j];
					puz_board[i-1][j]=0;
					refall=true;
				}
			}
		}
		for(let i=0;i<WIDTH;i++){
			if(puz_board[0][i]==0){
				puz_board[0][i]=Math.floor(Math.random()*ORB_COLORS)+1;
				refall=true;
			}
		}
	}
}function onmouce_cell(cell){
	const CELL_Y = cell.target.parentNode.rowIndex;
	const CELL_X = cell.target.cellIndex;
	const CELL_COLOR = puz_board[CELL_Y][CELL_X];
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
}function onleave_cell(cell){/*cell.target.style.backgroundColor = "red";*/}
function chain_toggler(cell){
	const CELL_Y = cell.target.parentNode.rowIndex;
	const CELL_X = cell.target.cellIndex;
	const CELL_COLOR = puz_board[CELL_Y][CELL_X];
	if(chain_now){//チェイン終了時の処理
		chain_now=false;
		if(chain_count>=3){
			score+=Math.floor(Math.pow(chain_count,1.5)*BASE_SCORE)//1.5は適当
			hand--;
			chain_yx.forEach(function(value){
				puz_board[value[0]][value[1]]=0;
			});
			update_display();
			falling_orb();
			update_display();
		}
		chain_yx.forEach(function(value){
			puz_board_bone[value[0]][value[1]].style.backgroundColor = "transparent";
			chain_used[value[0]][value[1]]=false;
		});
		chain_count=0;
		chain_color=null;
		chain_yx=[];
		if(hand<=0){
			alert("ゲームオーバー！　スコアは"+score+"でした！");
			board_init();
		}
	}else if(CELL_COLOR!=0){//チェイン開始の処理
		chain_now=true;
		chain_color=CELL_COLOR;
		chain_count=1;
		chain_yx.push([CELL_Y,CELL_X]);
		cell.target.style.backgroundColor = "blue";
	}
}function board_init(){//この関数はhttps://bubudoufu.com/sudoku/ を参考に作成
	hand=HAND_MAX;
	score=0;
	const main = document.querySelector("#puz_board");
	main.innerHTML = null;
	for (let i = 0; i < HEIGHT; i++) {
		let tr = document.createElement("tr");
		tr.classList.add("puz_board_tr");
		puz_board[i]=Array(WIDTH);
		puz_board_bone[i]=Array(WIDTH);
		chain_used[i]=Array(WIDTH).fill(false);
			for (let j = 0; j < WIDTH; j++) {
				let td = document.createElement("td");
				td.classList.add("inboard");
				tr.appendChild(td);
				puz_board[i][j] = Math.floor(Math.random()*ORB_COLORS)+1;//1~ORB_COLORS、整数、ランダム
				puz_board_bone[i][j] = td;
				td.onmouseover = onmouce_cell;
				td.onmouseleave = onleave_cell;
				td.addEventListener('click',chain_toggler);
			}
		main.appendChild(tr);
	}
	update_display();
}board_init();