
class HelpDlg extends eui.Component{
    public constructor() {
        super();
        
        this.addEventListener( eui.UIEvent.COMPLETE, this.uiCompHandler, this );
        this.skinName = "resource/eui_dlg/HelpDlg.exml";
        this.percentWidth = 100;
        this.percentHeight = 100;
    }

    private returnBtn:eui.Button;

    private uiCompHandler():void {
        this.returnBtn.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.returnBtnCallback, this);
        this.returnBtn.addEventListener(egret.TouchEvent.TOUCH_END, this.returnBtnCallback, this);
        this.returnBtn.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.returnBtnCallback, this);
    }

    //  home按钮回调
    private returnBtnCallback(evt:egret.TouchEvent):void {
        if(evt.type == egret.TouchEvent.TOUCH_BEGIN){
            evt.currentTarget.scaleX = 1.05;
            evt.currentTarget.scaleY = 1.05;
        }else if(evt.type == egret.TouchEvent.TOUCH_END){
            evt.currentTarget.scaleX = 1.0;
            evt.currentTarget.scaleY = 1.0;
            var event:GameEvent = new GameEvent(GameEvent.GAME_START);
            this.dispatchEvent(event);
        }else if(evt.type == egret.TouchEvent.TOUCH_RELEASE_OUTSIDE){
            evt.currentTarget.scaleX = 1.0;
            evt.currentTarget.scaleY = 1.0;
        }

    }

}