class GameOverDlg extends eui.Component{
    private stageW:number = 0;
    private stageH:number = 0;
    private input:InputDlg;

    public constructor() {
        super();

        this.addEventListener( eui.UIEvent.COMPLETE, this.uiCompHandler, this );
        this.skinName = "resource/eui_dlg/GameOverDlg.exml";
        this.percentWidth = 100;
        this.percentHeight = 100;
    }

    private uiCompHandler():void {
        this.setUI();

    }
    private background:eui.Image;
    private resulttext:eui.Label;
    private needrankBtn:eui.Button;
    private againBtn:eui.Button;
	private backBtn:eui.Button;
	private rankBtn:eui.Button;

    private setUI() {
        //  获取屏幕大小
        this.stageW = Data.getStageWidth();
        this.stageH = Data.getStageHeight();
        var stageW = this.stageW;
        var stageH = this.stageH;

        var goldScore:string = egret.localStorage.getItem("goldScore");
        var shitScore:string = egret.localStorage.getItem("shitScore");
        var txt = this.resulttext;
        txt.width = egret.Stage.prototype.stageWidth;
		this.addChild(txt);
        txt.textAlign = egret.HorizontalAlign.CENTER;
        var t = parseInt(goldScore)// - 2*parseInt(shitScore);
        txt.text = "你的成绩为：" + t + "分！";

        
        this.needrankBtn.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.needrankBtnCallback, this);
        this.needrankBtn.addEventListener(egret.TouchEvent.TOUCH_END, this.needrankBtnCallback, this);
        this.needrankBtn.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.needrankBtnCallback, this);

        this.againBtn.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.againBtnCallback, this);
        this.againBtn.addEventListener(egret.TouchEvent.TOUCH_END, this.againBtnCallback, this);
        this.againBtn.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.againBtnCallback, this);

        this.backBtn.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.homeBtnCallback, this);
        this.backBtn.addEventListener(egret.TouchEvent.TOUCH_END, this.homeBtnCallback, this);
        this.backBtn.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.homeBtnCallback, this);

        this.rankBtn.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.rankBtnCallback, this);
        this.rankBtn.addEventListener(egret.TouchEvent.TOUCH_END, this.rankBtnCallback, this);
        this.rankBtn.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.rankBtnCallback, this);

    }
    // 我要上榜
    private needrankBtnCallback(evt:egret.TouchEvent):void {
        if(evt.type == egret.TouchEvent.TOUCH_BEGIN){
            evt.currentTarget.scaleX = 1.05;
            evt.currentTarget.scaleY = 1.05;
        }else if(evt.type == egret.TouchEvent.TOUCH_END){
            evt.currentTarget.scaleX = 1.0;
            evt.currentTarget.scaleY = 1.0;

            if(this.input==null){
                this.input = new InputDlg();
                this.addChild(this.input);
            }
            else{
                this.input.visible = true
            }

        }else if(evt.type == egret.TouchEvent.TOUCH_RELEASE_OUTSIDE){
            evt.currentTarget.scaleX = 1.0;
            evt.currentTarget.scaleY = 1.0;
        }
    }

    //  再来一次按钮事件
    private againBtnCallback(evt:egret.TouchEvent):void {
        if(evt.type == egret.TouchEvent.TOUCH_BEGIN){
            evt.currentTarget.scaleX = 1.05;
            evt.currentTarget.scaleY = 1.05;
        }else if(evt.type == egret.TouchEvent.TOUCH_END){
            evt.currentTarget.scaleX = 1.0;
            evt.currentTarget.scaleY = 1.0;
      
            var event:GameEvent = new GameEvent(GameEvent.GAME_CONTINUE);
            this.dispatchEvent(event);

        }else if(evt.type == egret.TouchEvent.TOUCH_RELEASE_OUTSIDE){
            evt.currentTarget.scaleX = 1.0;
            evt.currentTarget.scaleY = 1.0;
        }
    }

    //  返回按钮事件
    private homeBtnCallback(evt:egret.TouchEvent):void {
        if(evt.type == egret.TouchEvent.TOUCH_BEGIN){
            evt.currentTarget.scaleX = 1.05;
            evt.currentTarget.scaleY = 1.05;
        }else if(evt.type == egret.TouchEvent.TOUCH_END){
            evt.currentTarget.scaleX = 1.0;
            evt.currentTarget.scaleY = 1.0;
            var event:GameEvent = new GameEvent(GameEvent.GAME_BLEED);
            this.dispatchEvent(event);
        }else if(evt.type == egret.TouchEvent.TOUCH_RELEASE_OUTSIDE){
            evt.currentTarget.scaleX = 1.0;
            evt.currentTarget.scaleY = 1.0;
        }

    }

    //  排行榜按钮事件
    private rankBtnCallback(evt:egret.TouchEvent):void {
        if(evt.type == egret.TouchEvent.TOUCH_BEGIN){
            evt.currentTarget.scaleX = 1.05;
            evt.currentTarget.scaleY = 1.05;
        }else if(evt.type == egret.TouchEvent.TOUCH_END){
            evt.currentTarget.scaleX = 1.0;
            evt.currentTarget.scaleY = 1.0;
      
            var event:GameEvent = new GameEvent(GameEvent.GAME_TORANK);
            this.dispatchEvent(event);

        }else if(evt.type == egret.TouchEvent.TOUCH_RELEASE_OUTSIDE){
            evt.currentTarget.scaleX = 1.0;
            evt.currentTarget.scaleY = 1.0;
        }

    }
}