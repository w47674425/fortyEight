//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

class Main extends eui.UILayer {


    protected createChildren(): void {
        super.createChildren();

        egret.lifecycle.addLifecycleListener((context) => {
            // custom lifecycle plugin
        })

        egret.lifecycle.onPause = () => {
            egret.ticker.pause();
        }

        egret.lifecycle.onResume = () => {
            egret.ticker.resume();
        }

        //inject the custom material parser
        //注入自定义的素材解析器
        let assetAdapter = new AssetAdapter();
        egret.registerImplementation("eui.IAssetAdapter", assetAdapter);
        egret.registerImplementation("eui.IThemeAdapter", new ThemeAdapter());

        this.addToStage()

        this.runGame().catch(e => { 
            console.log(e);
        })
    }

    private async runGame() {
        Data.SCENT_WIDTH = this.stage.stageWidth;
        Data.SCENT_HEIGHT = this.stage.stageHeight;
        
        await this.loadResource()

        Game.GameLayer.Ins.OnLoad(this.stage); //层管理
        this.stage.addEventListener(egret.Event.ACTIVATE,()=>{
            Game.UpdateManager.Instance.setStop(false)
        },this);
        this.stage.addEventListener(egret.Event.DEACTIVATE,()=>{
            Game.UpdateManager.Instance.setStop(true)
        },this);


        this.createGameScene();
        /*const result = await RES.getResAsync("description_json")
        this.startAnimation(result);
        await platform.login();
        const userInfo = await platform.getUserInfo();
        console.log(userInfo);  
*/
    }

    private addToStage(event?){
        if(egret.Capabilities.isMobile){
            this.stage.scaleMode = egret.StageScaleMode.FIXED_WIDTH
        }else{
            this.stage.scaleMode = egret.StageScaleMode.SHOW_ALL
        }
    }

    private async loadResource() {
        try {
            const loadingView = new LoadingUI();
            this.stage.addChild(loadingView);
            await RES.loadConfig("resource/default.res.json", "resource/");
            await this.loadTheme();
            await RES.loadGroup("preload", 0, loadingView);
            this.stage.removeChild(loadingView);
        }
        catch (e) {
            console.error(e);
        }
    }

    private loadTheme() {
        return new Promise((resolve, reject) => {
            // load skin theme configuration file, you can manually modify the file. And replace the default skin.
            //加载皮肤主题配置文件,可以手动修改这个文件。替换默认皮肤。
            let theme = new eui.Theme("resource/default.thm.json", this.stage);
            theme.addEventListener(eui.UIEvent.COMPLETE, () => {
                resolve();
            }, this);

        })
    }

    //private textfield: egret.TextField;
    private scene:GameDlg;
    /**
     * 创建场景界面
     * Create scene interface
     */
    protected createGameScene(): void {
        var startScene = new BeginDlg();
        this.addChild(startScene);
        startScene.addEventListener(GameEvent.GAME_RANK, this.rank, this);
        startScene.addEventListener(GameEvent.GAME_GO, this.go, this);
        startScene.addEventListener(GameEvent.GAME_HELP, this.help, this);
    }

    /* 游戏准备 */
    private startgame():void {
        this.clearscene();
        this.removeChildren();
        var begindlg = new BeginDlg();
        this.addChild(begindlg);
        begindlg.addEventListener(GameEvent.GAME_RANK, this.rank, this);
        begindlg.addEventListener(GameEvent.GAME_GO, this.go, this);
        begindlg.addEventListener(GameEvent.GAME_HELP, this.help, this);
    }
    /*游戏排行榜*/ 
    private rank():void{
        //this.clearscene();
        //this.removeChildren();
        var rankScene = new RankDlg();
        this.addChild(rankScene);
        rankScene.addEventListener(GameEvent.GAME_START, this.startgame, this);
    }

    /* 游戏开始 */
    private go():void {
        this.clearscene();
        this.removeChildren();
        this.scene = new GameDlg();
        this.scene.onCreate(null);
        this.addChild(this.scene);

        this.scene.addEventListener(GameEvent.GAME_HIT, this.gameover, this);
    }

    /*gameover */
    private gameover(){
        this.clearscene();
        this.removeChildren();
        var layer = new GameOverDlg();
        this.addChild(layer);
        layer.addEventListener(GameEvent.GAME_CONTINUE, this.begingame, this);
        layer.addEventListener(GameEvent.GAME_BLEED, this.startgame, this);
        layer.addEventListener(GameEvent.GAME_TORANK,this.rank,this);
    }

    private begingame(){
        //console.log("startgame");
        this.go();
    }
     /* help */
    private help():void {
        this.clearscene();
        this.removeChildren();
        var layer = new HelpDlg();
        this.addChild(layer);
        layer.addEventListener(GameEvent.GAME_START, this.startgame, this);
    }

    private clearscene(){
        if(this.scene) 
        { 
            this.scene.onRelease();
            this.scene = null;
        }
    }
}
