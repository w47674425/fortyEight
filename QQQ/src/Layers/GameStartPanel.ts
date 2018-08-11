/**
*游戏的开始主面板
* 
* Five
*/
class GameStartPanel extends eui.Component {

    constructor() {
        super();
        this.addEventListener(egret.Event.COMPLETE, this.complete, this);
        this.skinName = "resource/eui_skins/begin.exml";
    }

    private complete() {
        this.addEventListener(egret.TouchEvent.TOUCH_END, this.startGame, this);
    }

    private startGame() {
        this.parent.dispatchEventWith("startGame", true);
    }

    private explainGame() {
        this.parent.removeChild(this);
        this.dispatchEventWith("explainGame");
    }
}
