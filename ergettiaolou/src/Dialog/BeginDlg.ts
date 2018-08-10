class BeginDlg extends eui.Component{
	 public constructor() {
		super();
        
        this.addEventListener( eui.UIEvent.COMPLETE, this.uiCompHandler, this );
        this.skinName = "resource/eui_dlg/BeginDlg.exml";
        
        this.percentWidth = 100;
        this.percentHeight = 100;
	}

	private startBtn:eui.Button;
	private helpBtn:eui.Button;
	private rankBtn:eui.Button;

    private uiCompHandler():void {
        this.rankBtn.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.rankCallback, this);
        this.rankBtn.addEventListener(egret.TouchEvent.TOUCH_END, this.rankCallback, this);
        this.rankBtn.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.rankCallback, this);

        this.startBtn.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.startBtnCallback, this);
        this.startBtn.addEventListener(egret.TouchEvent.TOUCH_END, this.startBtnCallback, this);
        this.startBtn.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.startBtnCallback, this);

        this.helpBtn.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.helpBtnCallback, this);
        this.helpBtn.addEventListener(egret.TouchEvent.TOUCH_END, this.helpBtnCallback, this);
        this.helpBtn.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.helpBtnCallback, this);

         /// 返回逻辑
        //this.btnReturn.addEventListener( egret.TouchEvent.TOUCH_TAP, ()=> {
        //    this.dispatchEventWith( GameEvents.EVT_RETURN );
        //}, this );
    }

	//  排行按钮回调
    private rankCallback(evt:egret.TouchEvent):void {
        if(evt.type == egret.TouchEvent.TOUCH_BEGIN){
            evt.currentTarget.scaleX = 1.05;
            evt.currentTarget.scaleY = 1.05;
        }else if(evt.type == egret.TouchEvent.TOUCH_END){
            evt.currentTarget.scaleX = 1.0;
            evt.currentTarget.scaleY = 1.0;
            var event:GameEvent = new GameEvent(GameEvent.GAME_RANK);
            this.dispatchEvent(event);  
        }else if(evt.type == egret.TouchEvent.TOUCH_RELEASE_OUTSIDE){
            evt.currentTarget.scaleX = 1.0;
            evt.currentTarget.scaleY = 1.0;
        }

    }


	//  开始按钮回调
    private startBtnCallback(evt:egret.TouchEvent):void {
        if(evt.type == egret.TouchEvent.TOUCH_BEGIN){
            evt.currentTarget.scaleX = 1.05;
            evt.currentTarget.scaleY = 1.05;
        }else if(evt.type == egret.TouchEvent.TOUCH_END){
            evt.currentTarget.scaleX = 1.0;
            evt.currentTarget.scaleY = 1.0;
            var event:GameEvent = new GameEvent(GameEvent.GAME_GO);
            this.dispatchEvent(event);
        }else if(evt.type == egret.TouchEvent.TOUCH_RELEASE_OUTSIDE){
            evt.currentTarget.scaleX = 1.0;
            evt.currentTarget.scaleY = 1.0;
        }

    }

    //  help按钮回调
    private helpBtnCallback(evt:egret.TouchEvent):void {
        if(evt.type == egret.TouchEvent.TOUCH_BEGIN){
            evt.currentTarget.scaleX = 1.05;
            evt.currentTarget.scaleY = 1.05;
        }else if(evt.type == egret.TouchEvent.TOUCH_END){
            evt.currentTarget.scaleX = 1.0;
            evt.currentTarget.scaleY = 1.0;
            this.touchEnabled = false;
            this.startBtn.touchEnabled = false;
            this.helpBtn.touchEnabled = false;
            var event:GameEvent = new GameEvent(GameEvent.GAME_HELP);
            this.dispatchEvent(event);
        }else if(evt.type == egret.TouchEvent.TOUCH_RELEASE_OUTSIDE){
            evt.currentTarget.scaleX = 1.0;
            evt.currentTarget.scaleY = 1.0;
        }
    }
}