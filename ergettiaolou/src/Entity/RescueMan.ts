class RescueMan extends egret.Sprite{
	public constructor() {
		super();
		this.init();
	}
	private man:egret.Bitmap;
	private init(){
		var scrW = Data.getStageWidth();
		var scrH = Data.getStageHeight();
		var bitmap = new egret.Bitmap();
		bitmap.texture = RES.getRes("lanzi_png");
		bitmap.height *= 0.4;
		bitmap.width *= 0.4;
		this.addChild(bitmap);
		this.x = Data.getStageWidth()/2 - bitmap.width/2;
		this.y = 0.9 * Data.getStageHeight() - bitmap.height;
	}
}