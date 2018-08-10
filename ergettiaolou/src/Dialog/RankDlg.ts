// TypeScript file

class RankDlg extends eui.Component{
    public constructor() {
        super();
        
        this.addEventListener( eui.UIEvent.COMPLETE, this.uiCompHandler, this );
        this.skinName = "resource/eui_dlg/RankDlg.exml";
        this.percentWidth = 100;
        this.percentHeight = 100;
        this.posturl();
    }

    private returnBtn:eui.Button;
    private ranklist:eui.List;
    private ranklist_name:eui.List;
    private ranklist_score:eui.List;


    private uiCompHandler():void {
        this.returnBtn.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.returnBtnCallback, this);
        this.returnBtn.addEventListener(egret.TouchEvent.TOUCH_END, this.returnBtnCallback, this);
        this.returnBtn.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.returnBtnCallback, this);
    }

    private posturl():void {
        HttpAPI.HttpGET("https://jhjhw.ztgame.com.cn/wxxiaochengxu/gameinfo/app/models/DBSelectOrderByScore.php",null,this.onGetComplete,this.onGetIOError,this);  
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


    //消息回调
     private onGetComplete(event:egret.Event):void {
        var request = <egret.HttpRequest>event.currentTarget;
        egret.log("get data : ",request.response);
        let rankarr:Array<any> = JSON.parse(request.response);
        var textY = 15;
        for( var i= 0; i< rankarr.length; i++)
        {
            var rank = new egret.TextField();
            rank.width = egret.Stage.prototype.stageWidth;
            rank.y = textY;
            rank.x = 30;
            rank.textAlign = egret.HorizontalAlign.CENTER;
            rank.size = 35;
            rank.textColor = 0xffffee;
            rank.text = ''+(i+1)
            this.ranklist.addChild(rank);

            var rank2 = new egret.TextField();
            rank2.width = egret.Stage.prototype.stageWidth;
            rank2.y = textY;
            rank2.x = 30;
            rank2.textAlign = egret.HorizontalAlign.CENTER;
            rank2.size = 35;
            rank2.textColor = 0xffffff;
            rank2.text =  rankarr[i].ID 
            this.ranklist_name.addChild(rank2);

            var rank3 = new egret.TextField();
            rank3.width = egret.Stage.prototype.stageWidth;
            rank3.y = textY;
            rank3.x = 30;
            rank3.textAlign = egret.HorizontalAlign.CENTER;
            rank3.size = 35;
            rank3.textColor = 0xffffff;
            rank3.text = rankarr[i].SCORE;
            this.ranklist_score.addChild(rank3);

            textY += 73;
        }

    }

    private onGetIOError(event:egret.IOErrorEvent):void {
        egret.log("get error : " + event);
    }

}