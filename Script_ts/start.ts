export default (scenes : any) => {
	const CLEARBONUS = 100;
	if (!localStorage.maxStage) localStorage.maxStage = 1; //NEVER ZERO
	if (!localStorage.haveCoin) localStorage.haveCoin = 0;
	const DIV_STAGE_SELECT = document.getElementById("stage_select")!;
	const INPUT_STAGE_LINK = document.getElementById("StageLink")! as HTMLInputElement;
	const START_BUTTON = document.getElementById("startbutton")!;
	const initer = (wasSuccess = false, stagePlayed = -1) => {
		if (wasSuccess) {
			localStorage.haveCoin -= (-CLEARBONUS);
			if (stagePlayed === Number(localStorage.maxStage)) localStorage.maxStage++;
		}
		DIV_STAGE_SELECT.style.display = "block";
		START_BUTTON.onclick = () => {
			const STAGE_ID = Number(INPUT_STAGE_LINK.value);
			if (isNaN(STAGE_ID) || STAGE_ID < 1) {
				alert("正の数字を入力しろぉ！");
				return 1;
			}
			if (localStorage.maxStage < STAGE_ID) {
				alert(`未開放！最大ステージ番号：${localStorage.maxStage}`);
				return 1;
			}
			DIV_STAGE_SELECT.style.display = "none";
			scenes.puzzle(STAGE_ID);
			return 0;
		};
	};
	return initer;
};
