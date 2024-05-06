export default {//ここにパズルの初期情報を入れてください。
	"size":{
		"Height" : 10,
		"Width" : 10
	},
	"target":{
		"hand":15,
		"score":-10000,
		"obj" : {
			"-2" : 9//個数
		},
		"field" : {
			"1" : 8 // 個数
		}
	},
	"board":{
		"obj":[
			[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
			[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
			[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
			[[-1,9],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[-1,9]],
			[[0,0],[-1,9],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[-1,9],[0,0]],
			[[0,0],[0,0],[-1,9],[0,0],[0,0],[0,0],[0,0],[-1,9],[0,0],[0,0]],
			[[0,0],[0,0],[0,0],[-1,9],[0,0],[0,0],[-1,9],[0,0],[0,0],[0,0]],
			[[0,0],[0,0],[0,0],[0,0],[-1,9],[-1,9],[0,0],[0,0],[0,0],[0,0]],
			[[-2,1],[-2,1],[-2,1],[-2,1],[-2,1],[-2,1],[-2,1],[-2,1],[-2,1],[-2,1]],
			[[-2,1],[-2,1],[-2,1],[-2,1],[-2,1],[-2,1],[-2,1],[-2,1],[-2,1],[-2,1]]
		],
		"field":[
			[[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1]],
			[[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1]],
			[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
			[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
			[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
			[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
			[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
			[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
			[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
			[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]]
		]
	}
};