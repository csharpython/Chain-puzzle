"use strict";
export default class dataSaver {
    //class dataSaver {
    /**
     * dataSaverクラスのインスタンスを生成。保存先がnullなら空のJSONを保存する。
     * @constructor
     * @this {dataSaver}
     * @param {string} ref 保存先
     */
    constructor(ref) {
        this.ref = ref;
        //init
        if (localStorage.getItem(ref) == null)
            localStorage.setItem(ref, "{}");
        this.data = JSON.parse(localStorage.getItem(ref));
    }
    /**
     * データを読み取る
     * @param {(string | number)[]} path
     * @returns {any} 読み取った値
     */
    getData(path) {
        return path.reduce((prev, curr) => prev?.[curr], this.data);
    }
    /**
     * データを保存します。パスがぞんざいしなかったらエラー出す
     * @param {(string | number)[]} path
     * @param {any} data 保存したいデータ
     * @returns {bool} 書き込みに成功したか
     */
    setData(path, data) {
        if (path.length == 0)
            throw new Error("Can't save at root");
        const UNTIL_OBJ = this.getData(path.slice(0, -1));
        console.info(UNTIL_OBJ);
        const PATH_LAST = path.at(-1);
        UNTIL_OBJ[PATH_LAST] = data;
        localStorage.setItem(this.ref, JSON.stringify(this.data));
        return true;
    }
    /**
     * データが存在しない場合のみそれを保存します。
     * @param {(string | number)[]} path
     * @param {any} data 保存したいデータ
     * @returns {bool} 書き込みに成功したか
     */
    initData(path, data) {
        if (path.length == 0)
            throw new Error("Can't save at root");
        const UNTIL_OBJ = this.getData(path.slice(0, -1));
        console.info(UNTIL_OBJ);
        const PATH_LAST = path.at(-1);
        if (UNTIL_OBJ[PATH_LAST] !== void 0)
            return false;
        UNTIL_OBJ[PATH_LAST] = data;
        localStorage.setItem(this.ref, JSON.stringify(this.data));
        return true;
    }
}
