class GameDlg extends eui.Component implements Game.IObject {
	public constructor() {
		super();
		this.id = Common.Token;
		this.addEventListener(eui.UIEvent.COMPLETE, this.uiCompHandler, this);
		this.skinName = "resource/eui_dlg/GameDlg.exml";

		this.percentWidth = 100;
        this.percentHeight = 100;
	}
	private id: number;
	public get ID(): number { return this.id; }

	private uiCompHandler(): void {
		//this.pauseBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.pauseClicked, this);
	}

	private background: eui.Image;
	private scoretext:eui.Label;
	private comboshow:eui.BitmapLabel;
	//private pauseBtn:eui.Button;
	private getscoreshow:eui.BitmapLabel;

	private jumplist: Array<Entity> = [];
	private RescueMan: RescueMan;
	private score: number = 0;
	private combonum: number = 0;
	private comboState:StateCombo = StateCombo.stop;

	private gamesound: any;
	private gamesoundchanel:any;

	public onCreate(obj: any) {
		Game.UpdateManager.Instance.RegisterModule(this);

		this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.startmovelanzi, this);
		this.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.movelanzi, this);

		this.initByConfig()
		this.initRescueMan();

		this.creatediesound();
	}

	public onRelease(): void {
		this.gamesoundchanel.stop();  
		Game.UpdateManager.Instance.UnRegisterModule(this);
	}

	public setPause(b:boolean): void{
		
	}

	private totaltime: number = 0;

	private manintervaltime: number = 2000;
	private curmanintervaltime: number = 2000;
	private lastmantime: number = 0;
	
	private starintervaltime: number = 10000;
	private curstarintervaltime: number = 10000;
	private laststartime: number = 0;

	private curdifficult = 0; //难度
	private difficultaddscore = 50; //每50分增加难度
	private speedrate = 0.01 //难度影响的速度率
	private timerate = 0.01 //难度影响的时间率
	private timebottom = 0.5 //难度影响的时间最低的比率
	private difficultlist: Array<DifficultData> = [];

	// 读取json配置
	private initByConfig(){
		var data = RES.getRes("gamemain_json");
		if(data)
		{
			/*var gamedata = data.game;
			if(!gamedata) return*/
			
			var diff = data.difficult
			if(!diff) return
			for (var i: number = 0; i < diff.length; i++) {
				var diffdata = new DifficultData()
				diffdata.score = parseInt(diff[i].score)
				diffdata.manintervaltime = parseInt(diff[i].manintervaltime)
				diffdata.starintervaltime = parseInt(diff[i].starintervaltime)
				diffdata.speedrate = parseFloat(diff[i].speedrate)
				diffdata.timerate = parseFloat(diff[i].timerate)
				this.difficultlist.push(diffdata)
			}
		}
		this.changeDifficult()
	}

	public onUpdate(passTime: number): void {
		var ptime = passTime*(1+this.curdifficult*this.speedrate) //增加每帧运动的时间 以增加整体速度
		this.totaltime += ptime
		// 2s随机一个人
		if (this.totaltime - this.lastmantime > this.curmanintervaltime) {
			this.createJumpMan()

			this.lastmantime = this.totaltime;
		}
		// 10s随机一颗星星或者炸弹
		if (this.totaltime - this.laststartime > this.curstarintervaltime) {
			if(Math.random() * 2 >= 1){
				this.createStar()
			}
			else{
				this.createBomb()
			}

			this.laststartime = this.totaltime;
		}
		
		// 检测分数
		for (var i = 0; i < this.jumplist.length;) {
			if(this.jumplist[i].isDie()){
				i++
				continue
			}
			if (this.jumplist[i].y > Data.SCENT_HEIGHT - this.jumplist[i].getEntityHeight() - 30) {
				if(enumEntityType.ItemBomb != this.jumplist[i].type && enumEntityType.ItemStar != this.jumplist[i].type){
					//this.jumplist[i].die() //只一次
					this.gameOver();
					return;
				}
			}
			//console.log(this.jumplist[i].y)
			var getscorepoint = Common.checkCatch(this.jumplist[i], this.RescueMan)
			if (getscorepoint > 0) {
				//combo
				if(this.jumplist[i].type == enumEntityType.ItemBomb)
					getscorepoint = 0;
				if(getscorepoint==2){
					this.comboState = StateCombo.add;
					this.combonum ++ ;
					this.initComboAni();
			
					}
				else{
					if(this.jumplist[i].type != enumEntityType.ItemStar)
					{
						this.comboState = StateCombo.stop;
						this.combonum = 0												
					}
				}		
				////addscore
				var addscore = this.jumplist[i].getHitScore(getscorepoint,this.combonum);	
				var fuhaostr = addscore > 0 ?"+":"-";
				this.getscoreshow.text =  fuhaostr + Math.abs(addscore);
				this.initgetscoreshowAni()
				this.score += addscore;
				this.changeDifficult();
				this.showScore();

				// 接住的人先做动作后面删
				if(this.jumplist[i].type < enumEntityType.EntityMax){
					this.jumplist[i].die()
					i++;
				}
				else{
					// 先这样删除
					this.removeChild(this.jumplist[i]);
					this.jumplist[i].onRelease();
					this.jumplist[i] = null;
					this.jumplist.splice(i, 1);
				}
			}
			else
				i++;
		}

		for (var i = 0; i < this.jumplist.length;) {
			if(this.jumplist[i].isState(StateType.End)){
				// 先这样删除
				this.removeChild(this.jumplist[i]);
				this.jumplist[i].onRelease();
				this.jumplist[i] = null;
				this.jumplist.splice(i, 1);
			}
			else
				i++;
		}

		if(this.comboState == StateCombo.add)
		{
			if( this.combonum>1){
				this.comboshow.scaleX = 0.5;
				this.comboshow.scaleY = 0.5;
				this.comboshow.textAlign = egret.HorizontalAlign.CENTER;
				this.comboshow.text = "cx" + this.combonum;
				this.comboshow.visible = true;
			}
		}else{
			this.comboshow.visible = false;
		}
	}

	private createJumpMan(){
		var jm = new JumpMan();
		jm.onCreate(null);
		this.addChild(jm);
		this.jumplist.push(jm);
	}

	private createStar(){
		var um = new ItemStar();
		um.onCreate(null);
		this.addChild(um);
		this.jumplist.push(um);
	}

	private createBomb(){
		var jb = new ItemBomb();
		jb.onCreate(null);
		this.addChild(jb);
		this.jumplist.push(jb);
	}

	private initComboAni(){
		this.comboshow.scaleX = 0.5; 
		this.comboshow.scaleY = 0.5; 
		var twn: egret.Tween = egret.Tween.get(this.comboshow);
         twn.to({ "scaleX": 0.4 }, 100).call(function () {}, this);
		 twn.to({ "scaleY": 0.2 }, 100).call(function () {}, this);
	}

	private initgetscoreshowAni(){
		this.getscoreshow.scaleY = 0.3; 
		var twn: egret.Tween = egret.Tween.get(this.getscoreshow);
         //twn.to({ "scaleX": 0.4 }, 100).call(function () {}, this);
		 twn.to({ "scaleY": 1.0 }, 50).call(function () {}, this);
	}

	private initRescueMan() {
		//援救者
		var man = new RescueMan();
		this.addChild(man);
		this.RescueMan = man;
	}

	private changeDifficult(){
		if(this.difficultlist.length == 0)
			return
		//每过一定分数难度增加(整数) 读配置
		var levelindex: number = 0;
		for (var i: number = 0; i < this.difficultlist.length; i++) {
			if(this.score >= this.difficultlist[i].score)
				levelindex = i
			else
				break
		}
		this.curdifficult = levelindex
		this.curmanintervaltime = this.difficultlist[levelindex].manintervaltime
		this.curstarintervaltime = this.difficultlist[levelindex].starintervaltime
		this.speedrate = this.difficultlist[levelindex].speedrate
		this.timerate = this.difficultlist[levelindex].timerate
	}
	private showScore() {
		this.scoretext.text = "得分：" + this.score;
		
		var key: string = "goldScore";
		var value: string = "" + this.score;
		egret.localStorage.setItem(key, value);
	}

	private startpoint:egret.Point = new egret.Point();
	private startmovelanzi(evt: egret.TouchEvent){
		this.startpoint.x = evt.stageX
	}

	private movelanzi(evt: egret.TouchEvent) {
		var xpos:number = this.RescueMan.x + evt.stageX - this.startpoint.x
		if(xpos < 0)
			xpos = 0
		else if(xpos > Data.getStageWidth())
			xpos = Data.getStageWidth()
		this.RescueMan.x = xpos
		this.startpoint.x = evt.stageX
		//	console.log(this.RescueMan.x)
	}

	private gameOver() {
		for (var i = 0; i < this.jumplist.length; ++i) {
			this.jumplist[i].onRelease();
		}
		this.showScore();
		//this.removeChild(this.RescueMan);
		//console.log("游戏结束");
		var event: GameEvent = new GameEvent(GameEvent.GAME_HIT);
		this.dispatchEvent(event);
		this.postRank(this.score);
		this.onRelease()
	}

	private postRank(score: number): void {
		HttpAPI.HttpPOST("https://jhjhw.ztgame.com.cn/wxxiaochengxu/gameinfo/app/models/DBUpdateTable.php", "score=" + score, this.onPostComplete, this.onPostIOError, this);
	}

	private onPostComplete(event: egret.Event): void {
		var request = <egret.HttpRequest>event.currentTarget;
		//egret.log("post data : ", request.response);
	}
	private onPostIOError(event: egret.IOErrorEvent): void {
		//egret.log("get error : " + event);
	}

	private pauseClicked(){
		Game.UpdateManager.Instance.setStop(!Game.UpdateManager.Instance.IsStop)
	}

	private creatediesound():void{  
        this.gamesound = new egret.Sound();
        var url:string = "resource/assets/sound/testbgm.mp3";
        this.gamesound.load(url);
        this.gamesound.addEventListener(egret.Event.COMPLETE, this.onLoadComplete, this);
        
    }
	private onLoadComplete(event:egret.Event):void {
        var sound:egret.Sound = <egret.Sound>event.target;
        this.gamesoundchanel = sound.play(0,0);
    }
}