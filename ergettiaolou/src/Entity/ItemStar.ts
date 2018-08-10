class ItemStar extends ItemEntity{
	public constructor() {
		super();
		this.init();
	}
	public get type(): number { return enumEntityType.ItemStar }

	protected init(){
		this.image = Common.createBitmapByName("star_png");
		this.addChild(this.image);

		this.initByConfig()
	}

	protected initByConfig(){
		var data = RES.getRes("gamemain_json");
		if(data)
		{
			var gamedata = data.itemstar;
			if(!gamedata) return

			this.image.width = parseInt(gamedata.width);
			this.image.height = parseInt(gamedata.height);
			
			this.startx = Math.floor(Math.random() * 500) + 40
			this.x = this.startx;
			this.starty = 0.148*Data.getStageHeight() - this.getEntityHeight();
			this.y = this.starty;
			this.speedx = parseFloat(gamedata.speedx);
			this.speedy = parseFloat(gamedata.speedy);
			this.jumptime = parseInt(gamedata.jumptime);
			this.basescore = parseInt(gamedata.basescore);
			this.highscore = parseInt(gamedata.highscore);
		}
	}

	public getHitScore(catchhit:number,combonum:number): number{
 		return this.basescore;
	}
}