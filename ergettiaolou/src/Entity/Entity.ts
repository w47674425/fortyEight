class Entity extends egret.Sprite implements Game.IObject{
	public constructor() {
		super();
		this.id = Common.Token;
		this.init();
	}
	protected image:egret.Bitmap;
    protected imagepath:string;
	protected init(){
	}

	private id: number;
	public get ID(): number { return this.id; }
	public get type(): number { return enumEntityType.Entity }

	protected basescore:number = 1;
	protected highscore:number = 2;
	public  getbasescore(): number { return this.basescore; }
	public  gethighscore(): number { return this.highscore; }

	//虚方法，需要Override
    public onUpdate(passTime: number): void {
		
	}
	public setPause(b:boolean): void{
		
	}
	public isDie(){
		return false;
	}
	public die(){}
	public isState(istate:number){
	}
	public changeState(istate:number){
	}
	public getHitScore(catchhit:number,combonum:number): number{
		return 0;
	}

    public onCreate(parent: egret.DisplayObjectContainer): void {
		Game.UpdateManager.Instance.RegisterModule(this);
	}
	public onRelease(): void {
		Game.UpdateManager.Instance.UnRegisterModule(this);
	}
	public getEntityWidth() : number{
		return this.width;
	}
	public getEntityHeight() : number{
		return this.height;
	}
}