import dataSaver from "./dataSaver.js"
export default (scenes : any) => {
	const Saver = new dataSaver("savedata");
	const CLEARBONUS = 100;
	Saver.initData(["maxstage"],1);
	Saver.initData(["haveCoin"],0);
	const DIV_STAGE_SELECT = document.getElementById("stage_select")!;
	const INPUT_STAGE_LINK = document.getElementById("StageLink")! as HTMLInputElement;
	const START_BUTTON = document.getElementById("startbutton")!;
	const initer = (wasSuccess = false, stagePlayed = -1) => {
		if (wasSuccess) {
			Saver.setData(["haveCoin"],Saver.getData(["haveCoin"])+CLEARBONUS);
			Saver.setData(["maxstage"],Math.max(Saver.getData(["maxstage"]),stagePlayed+1));
		}
		DIV_STAGE_SELECT.style.display = "block";
		START_BUTTON.onclick = () => {
			const MAXSTAGE = Saver.getData(["maxstage"]);
			const STAGE_ID = Number(INPUT_STAGE_LINK.value);
			if (isNaN(STAGE_ID) || STAGE_ID < 1) {
				alert("正の数字を入力しろぉ！");
				return 1;
			}
			if (MAXSTAGE < STAGE_ID) {
				alert(`未開放！最大ステージ番号：${MAXSTAGE}`);
				return 1;
			}
			DIV_STAGE_SELECT.style.display = "none";
			scenes.puzzle(STAGE_ID);
			return 0;
		};
	};
	return initer;
};
