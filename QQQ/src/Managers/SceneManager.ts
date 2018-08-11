/**
 * Created by Five on 2018/06/03
 */
class SceneManager{
    
    public static instance:SceneManager = null;
    private gameLayer:Main = null;
    private runninglayer: egret.DisplayObjectContainer = null;
    private stackLayer = [];
    private collector:egret.Timer = null;
    private timeSpan = 1 * 1000; // 回收器

    public static Instance() {
        if (SceneManager.instance == null) {
            SceneManager.instance = new SceneManager();
        }
        return SceneManager.instance;
    }    
    
    public initWithMain(m:Main) {
        if (this.gameLayer == null) {
            this.gameLayer = m;
        }
    }

    public constructor() {
        this.collector = new egret.Timer(this.timeSpan,0);
        this.collector.addEventListener(egret.TimerEvent.TIMER,this.timerCallback,this);
    }  

    private timerCallback()
    {

    }
    
    //替换场景
    public repleaceScene(layer:egret.DisplayObjectContainer) {
        if (this.gameLayer != null && layer != null) {
            this.gameLayer.removeChildren();
            this.gameLayer.addChild(layer);
            this.runninglayer = layer;
        }
    }
    //添加场景
    public pushScene(layer:egret.DisplayObjectContainer) {
        if (this.gameLayer != null && layer != null) {
            this.gameLayer.addChild(layer);
            this.stackLayer.push(layer);
            this.runninglayer = layer;
        }
    }

    public runningScene() : egret.DisplayObjectContainer {
        return this.runninglayer;
    }

}
