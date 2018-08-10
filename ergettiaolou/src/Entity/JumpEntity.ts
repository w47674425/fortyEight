class JumpEntity extends Entity{
	public constructor() {
		super();
		this.init();
	}
	protected speedx:number = 0;
    protected speedy:number = 30;
	protected gravity:number = 9.8 * 10; // 重力
	protected startx:number = 0;
	protected starty:number = 0; // 看背景图对好位置

	protected passedwaittime: number = 0;
	protected passedruntime: number = 0;
	protected passedjumptime: number = 0;
	protected passedjumpingtime: number = 0;
	protected passeddaoditime: number = 0;
	protected jumptime:number = 0;

	protected runspeed:number = 0;
	protected rundistance:number = 0;
	protected runtime:number = 0;

	protected mcstand:egret.MovieClip;
	protected mcjump:egret.MovieClip;
	protected mcrun:egret.MovieClip;
	protected mcdaodi:egret.MovieClip;
	protected curmc:egret.MovieClip;
	protected state:number = StateType.Stand;
	protected chattext:egret.TextField;

	public get type(): number { return enumEntityType.JumpEntity }

	protected init(){
		super.init();
		
		//this.initChat();
	}

	/*private initChat(){
		this.chattext = new egret.TextField();
		this.chattext.textColor = 0x000000;
		this.chattext.text = "法国必胜！";
		this.chattext.x += 30;
		this.addChild(this.chattext);

		var twn: egret.Tween = egret.Tween.get(this.chattext);
         twn.wait(this.standtime).to({ "alpha": 0 }, 500).call(function () {
             
         }, this);
	}*/

	protected initAction(){
	}
	public isDie(){
		return this.state >= StateType.Daodi;
	}
	public die(){
		this.changeState(StateType.Daodi)
		this.playAction("daodi");
	}
	public isState(istate:number){
		return this.state == istate
	}
	public changeState(istate:number){
		this.state = istate
	}
	protected playAction(action:string) {
		if(action == "stand"){
			if(!this.mcstand)
				return
			if(this.curmc)
				this.removeChild(this.curmc);
			this.mcstand.gotoAndPlay(action, -1);
			this.curmc = this.mcstand
			this.addChild(this.mcstand)
		}
		else if(action == "run"){
			if(!this.mcrun)
				return
			if(this.curmc)
				this.removeChild(this.curmc);
			this.mcrun.gotoAndPlay(action, -1);
			this.curmc = this.mcrun
			this.addChild(this.mcrun)
		}
		else if(action == "jump"){
			if(!this.mcjump)
				return
			if(this.curmc)
				this.removeChild(this.curmc);
			this.mcjump.gotoAndPlay(action, 1);
			this.curmc = this.mcjump;
			this.addChild(this.mcjump);
		}
		else if(action == "daodi"){
			if(!this.mcdaodi)
				return
			if(this.curmc)
				this.removeChild(this.curmc);
			this.mcdaodi.gotoAndPlay(action, 1);
			this.curmc = this.mcdaodi;
			this.addChild(this.mcdaodi);
		}
	}
	
	public onUpdate(passTime: number): void {
		super.onUpdate(passTime);

		if(this.state == StateType.Stand){
			this.passedwaittime += passTime;
			if(this.runspeed > 0 && this.passedwaittime < (this.runtime - this.rundistance/this.runspeed * 1000))
				return
			this.state = StateType.Run
			this.playAction("run");
		}
		else if(this.state == StateType.Run){
			this.passedruntime += passTime;
			this.x += passTime*this.runspeed*0.001
			if(this.x > this.rundistance + this.startx){
				this.state = StateType.JumpWait
			}
		}
		else if(this.state == StateType.JumpWait){
			//this.passedruntime += passTime;
			//if(this.passedruntime > this.runtime){
				this.state = StateType.Jump
				this.playAction("jump");
			//}
		}
		else if(this.state == StateType.Jump){
			this.passedjumptime += passTime;
			if(this.passedjumptime > this.jumptime)
				this.state = StateType.Jumping
		}
		else if(this.state == StateType.Jumping){
			this.passedjumpingtime += passTime;
			this.jumpingupdate(this.passedjumpingtime*0.001);
		}
		else if(this.state == StateType.Daodi){
			this.passeddaoditime += passTime;
			if(this.mcdaodi && this.passeddaoditime > 1000)
				this.state = StateType.End
		}
	}
	
	protected jumpingupdate(movetime: number) {
		var x = this.x;
		var y = this.y;
		var w = Data.getStageWidth();
		var h = Data.getStageHeight();
		y = this.speedy*movetime + 0.5*this.gravity*movetime*movetime + this.starty;
		this.x = x;
		this.y = y;
	}

	public getEntityWidth() : number{
		if(this.mcstand)
			return this.mcstand.width;
		return this.width;
	}

	public getEntityHeight(): number{
		if(this.mcstand)
			return this.mcstand.height;
		return this.width;
	}

}