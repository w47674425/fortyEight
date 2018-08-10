class Data {
	public static getStageWidth() {
		return this.SCENT_WIDTH;
	}

	public static getStageHeight() {
		return this.SCENT_HEIGHT;
	}

	public static SCENT_WIDTH = 0;
	public static SCENT_HEIGHT = 0;
}

class DifficultData{
	public manintervaltime:number = 2000;
	public starintervaltime:number = 10000;
	public score:number = 0;
	public speedrate:number = 0;
	public timerate:number = 0;
}

enum StateType {
	Stand,
	Run,
	JumpWait,
	Jump,
	Jumping,
	Daodi,
	End,
}

enum StateCombo {
	add,
	stop,
}

enum enumEntityType{
	Entity,
	JumpEntity,
	JumpMan,
	EntityMax,

	ItemEntity,
	ItemStar,
	ItemBomb,
	ItemMax,
}