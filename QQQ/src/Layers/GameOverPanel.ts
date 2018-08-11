/**
 *游戏的结束主面板
 * 
 * Five
 */
class GameOverPanel extends eui.Component {
    private t_l: eui.Image;
    private t_r: eui.Image;
    private t_l_g: eui.Image;
    private t_r_g: eui.Image;
    public constructor() {
        super();
        this.addEventListener(egret.Event.COMPLETE, this.complete, this);
        this.skinName = "resource/eui_skins/jiesuan.exml";

    }
    private complete() {
        SoundMenager.Shared().StopBGM();
        this.addEventListener(egret.TouchEvent.TOUCH_END, this.startGame, this);
    }

    public GameResult(e: egret.Event) {
        let data = e.data;
        if (data == "0")
            this.l_win();
        else
            this.r_win();
    }

    private l_win() {
        this.t_l_g.visible = false;
        this.t_r.visible = false;
    }

    private r_win() {
        this.t_l.visible = false;
        this.t_r_g.visible = false;
    }
    private startGame() {
        this.parent.dispatchEventWith("restartGame");
    }

}
