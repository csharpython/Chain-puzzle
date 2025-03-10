import dataSaver from "./dataSaver.js";
export default class startScene{
	Saver : dataSaver = new dataSaver("savedata");
	CLEARBONUS = 100 as const;
 	scenes : any;
	constructor(scene : any){
		this.scenes=scene;
		if(this.Saver.data.maxstage == null)this.Saver.data.maxstage = 1;
		if(this.Saver.data.haveCoin == null)this.Saver.data.haveCoin = 0;
		this.Saver.save();
	}
	DIV_STAGE_SELECT = document.getElementById("stage_select")!;
	INPUT_STAGE_LINK = document.getElementById("StageLink")! as HTMLInputElement;
	START_BUTTON = document.getElementById("startbutton")!;
	initer(wasSuccess = false, stagePlayed = -1){
		if (wasSuccess) {
			this.Saver.data.haveCoin+=this.CLEARBONUS;
			this.Saver.data.maxstage=Math.max(this.Saver.data.maxstage,stagePlayed+1);
			this.Saver.save();
		}
		this.DIV_STAGE_SELECT.style.display = "block";
		this.START_BUTTON.onclick = () => {
			const MAXSTAGE = this.Saver.data.maxstage;
			const STAGE_ID = Number(this.INPUT_STAGE_LINK.value);
			if (isNaN(STAGE_ID) || STAGE_ID < 1) {
				alert("正の数字を入力しろぉ！");
				return 1;
			}
			if (MAXSTAGE < STAGE_ID) {
				alert(`未開放！最大ステージ番号：${MAXSTAGE}`);
				return 1;
			}
			this.DIV_STAGE_SELECT.style.display = "none";
			this.scenes.puzzle.startgame(STAGE_ID);
			return 0;
		};
	};
};
