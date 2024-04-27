export default () => {
	const DIV_STAGE_SELECT = document.querySelector("#stage_select");
	const initer = () => {
		DIV_STAGE_SELECT.style.display = "block";
		document.querySelector("#startbutton").onclick = () => {
			DIV_STAGE_SELECT.style.display = "none";
			document.querySelector("#move_GAME").click();
		}
	}
	document.querySelector("#move_START").onclick = initer;
}