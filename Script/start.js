export default (scenes) => {
	const DIV_STAGE_SELECT = document.querySelector("#stage_select");
	const initer = () => {
		DIV_STAGE_SELECT.style.display = "block";
		document.querySelector("#startbutton").onclick = () => {
			DIV_STAGE_SELECT.style.display = "none";
			scenes.puzzle(document.getElementById('StageLink').value);
		}
	}
	return initer;
}