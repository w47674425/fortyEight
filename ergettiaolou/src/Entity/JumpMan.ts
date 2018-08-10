class JumpMan extends JumpEntity{
	public constructor() {
		super();
		this.init();
	}

	public get type(): number { return enumEntityType.JumpMan }
	
	protected init(){
		super.init();

		this.initByConfig()
		this.initAction();
		//this.playAction("stand");
	}

	protected initByConfig(){
		var data = RES.getRes("gamemain_json");
		if(data)
		{
			var gamedata = data.jumpman;
			if(!gamedata) return

			this.startx = parseInt(gamedata.x)
			this.x = this.startx;
			this.starty = 0.148*Data.getStageHeight() - this.getEntityHeight();
			this.y = this.starty;
			this.runspeed = parseInt(gamedata.runspeed);
			this.rundistance = Math.floor(Math.random() * 500)
			this.runtime = parseInt(gamedata.runtime);
			this.jumptime = parseInt(gamedata.jumptime);

			this.speedx = parseFloat(gamedata.speedx);
			this.speedy = parseFloat(gamedata.speedy);
			this.basescore = parseInt(gamedata.basescore);
			this.highscore = parseInt(gamedata.highscore);
		}
	}

	protected initAction(){
		this.mcstand = Common.LoadMovieClip("jumpman","action",this,0,0);
		this.mcrun = Common.LoadMovieClip("jumpman","action",this,0,0);
		this.mcjump = Common.LoadMovieClip("jumpman","action",this,0,0);
		this.mcdaodi = Common.LoadMovieClip("jumpman","action",this,0,0);
	}

	public getHitScore(catchhit:number,combonum:number): number{

		if(catchhit==1)
            return this.basescore;
        else if(catchhit==2)
        {
            var maxscore = this.highscore * combonum ;
            return maxscore > 10 ? 10 : maxscore
        }
	}
}