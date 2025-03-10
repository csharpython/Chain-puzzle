export type Board = {//ここにパズルの初期情報を入れてください。
	"size":{
		"Height" : number,
		"Width" : number
	},
	"target":{
		"hand":number,
		"score":number,
		"obj" : {
			[type:number] : number//個数
		},
		"field" : {
			[type:number] : number // 個数
		}
	},
	"board":{
		"obj": [number,number][][], // 左が属性、右が耐久値
		"field":[number,number][][]
	}
};