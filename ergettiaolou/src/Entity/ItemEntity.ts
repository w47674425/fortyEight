class ItemEntity extends Entity{
	public constructor() {
		super();
		this.init();
	}
	protected speedx:number = 0;
    protected speedy:number = 30;
	protected gravity:number = 9.8 * 10; // 重力
	protected startx:number = 0;
	protected starty:number = 0; // 看背景图对好位置

	protected jumptime:number = 0;
	protected passedjumptime: number = 0;
	protected passedjumpingtime: number = 0;
	protected bjump:boolean = false;
	protected runspeed:number = 0;
	protected rundistance:number = 0;

	protected state:number = StateType.Jump;

	public get type(): number { return enumEntityType.ItemEntity }

	protected init(){
		super.init();
	}
	
	public onUpdate(passTime: number): void {
		super.onUpdate(passTime);

		if(this.state == StateType.Jump){
			this.passedjumptime += passTime;
			if(this.passedjumptime > this.jumptime)
				this.state = StateType.Jumping
		}
		else if(this.state == StateType.Jumping){
			this.passedjumpingtime += passTime;
			this.jumpingupdate(this.passedjumpingtime*0.001);
		}
	}
	protected xdirect = 1; //右
	protected jumpingupdate(movetime: number) {
		var x = this.x;
		var y = this.y;
		var w = Data.getStageWidth();
		var h = Data.getStageHeight();
		if(x > 540)
			this.xdirect = -1
		else if(x < 40)
			this.xdirect = 1
		x += this.xdirect*this.speedx
		y = 0.5*this.gravity*movetime*movetime + this.starty;
		this.x = x;
		this.y = y;
	}

	public getEntityWidth() : number{
		return this.width;
	}

}