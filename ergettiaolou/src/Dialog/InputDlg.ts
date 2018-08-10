
class InputDlg extends eui.Component{
    public constructor() {
        super();
        
        this.addEventListener( eui.UIEvent.COMPLETE, this.uiCompHandler, this );
        this.skinName = "resource/eui_dlg/inputDlg.exml";
        this.percentWidth = 100;
        this.percentHeight = 100;
    }
    private background:eui.Image;
    private okBtn:eui.Button;
    private closeBtn:eui.Button;

    private uiCompHandler():void {
        this.background.touchEnabled = true
        this.okBtn.addEventListener( egret.TouchEvent.TOUCH_TAP, ()=> {
            this.visible = false
        }, this );

        this.closeBtn.addEventListener( egret.TouchEvent.TOUCH_TAP, ()=> {
            this.visible = false
        }, this );
    }

}