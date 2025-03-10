"use strict";
export default class dataSaver {
	//class dataSaver {
	#ref;data;
	/**
	 * dataSaverクラスのインスタンスを生成。保存先がnullなら空のJSONを保存する。
	 * @constructor
	 * @this {dataSaver}
	 * @param {string} ref 保存先
	 */
	constructor(ref) {
		this.#ref = ref;
		//init
		if (localStorage.getItem(ref) == null) localStorage.setItem(ref, "{}");
		this.data = JSON.parse(localStorage.getItem(ref));
	}
	/**
	 * データを保存する
	 */
	save() {localStorage.setItem(this.#ref, JSON.stringify(this.data));}
}
