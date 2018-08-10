var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = this && this.__extends || function __extends(t, e) { 
 function r() { 
 this.constructor = t;
}
for (var i in e) e.hasOwnProperty(i) && (t[i] = e[i]);
r.prototype = e.prototype, t.prototype = new r();
};
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        var _this = _super.call(this) || this;
        //准备工作
        _this.debug = false;
        _this.timeSpan = 5000;
        _this.stageH = egret.MainContext.instance.stage.stageHeight;
        _this.stageW = egret.MainContext.instance.stage.stageHeight;
        _this.circlePosX = 100; //把球摆放在距离屏幕左上角为100,100px位置
        _this.circlePosY = 100;
        _this.circleR = 50;
        //设置p2.js和egret二者距离的度量衡转换比例
        //p2.js 单位是MKS(米 千克 秒)，egert是像素px
        _this.factor = 50;
        //可理解为p2.js的一米长度是egert中屏幕的50px
        _this.rigidBody = new RigidBody();
        _this.addEventListener(egret.Event.ADDED_TO_STAGE, _this.onAddToStage, _this);
        return _this;
    }
    Main.prototype.onAddToStage = function (event) {
        //设置加载进度界面
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        //初始化Resource资源加载库
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/resource.json", "resource/");
    };
    /**
    * 配置文件加载完成,开始预加载preload资源组。
    */
    Main.prototype.onConfigComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.loadGroup("preload");
    };
    /**
    * preload资源组加载完成
    */
    Main.prototype.onResourceLoadComplete = function (event) {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            this.createGameScene();
        }
    };
    /**
    * preload资源组加载进度
    */
    Main.prototype.onResourceProgress = function (event) {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    };
    /**
    * 创建游戏场景
    */
    Main.prototype.createGameScene = function () {
        var _this = this;
        this.init();
        /*
         * 说明：首先要清楚，egret和p2.js是两个坐标系独立没有关联的库，
         * 需要我们手动代码进行转换和关联。
         * 关键的几步：
         *
         * 1. 转换坐标和度量
         *    p2.js坐标原点左下角，向上向右（重力为负）
         *    egert坐标原点左上角，向右向下
         *    p2.js使用MKS(米 千克 秒),egert使用px像素
         *
         * 2. 将egert图元贴到p2.js body上
         *    p2body.displays = [egert里面的displayobject]
         *
         */
        console.log("start");
        //创建地面
        var groundVsl = new egret.Shape();
        groundVsl.graphics.beginFill(0xaaccdd);
        groundVsl.graphics.drawRect(0, this.stageH - 10, this.stageW, 10);
        groundVsl.graphics.endFill();
        this.addChild(groundVsl); //立即加到场景里
        /*
         * 说明：
         * 先创造egert外观更方便，因为创建p2.js body时需要
         * 根据屏幕像素位置(egert位置)计算p2.js body的位置。
         */
        this.touchEnabled = true;
        var timer = new egret.Timer(this.timeSpan);
        timer.addEventListener(egret.TimerEvent.TIMER, function () {
            //创建圆
            var posX = Math.random() * 700;
            var posY = -Math.random() * 50;
            var circle = _this.rigidBody.createCircle(_this.circleR, posX, posY);
            _this.addChild(circle[0]);
            _this.world.addBody(circle[1]);
        }, this);
        timer.start();
        this.stage.addEventListener(egret.TouchEvent.TOUCH_END, function (e) {
            _this.world.bodies.forEach(function (body) {
                var posY = _this.stageH - body.position[1] * _this.factor;
                {
                    var x = Math.random() * 200 - 100;
                    var y = posY / 2;
                    body.applyForce([x, y], body.position);
                    // 清除所有力
                    // body.sleep();
                }
            });
        }, this);
        // ground and groundAndwall
        this.groundAndwall();
        this.generateBubbles();
        //第四步：p2.js世界动起来
        egret.Ticker.getInstance().register(function (dt) {
            var _this = this;
            //p2.js的世界时间流逝
            this.world.step(dt / 1000);
            //看不到的p2物体在下落，egret的外观图片也要时刻更新位置
            this.world.bodies.forEach(function (body) {
                if (body.displays) {
                    body.displays[0].x = body.position[0] * _this.factor;
                    body.displays[0].y = _this.stageH - body.position[1] * _this.factor;
                    if (body.displays[0].y > _this.stageH + 100) {
                        if (body.displays[0].x < 350)
                            console.log('left');
                        else
                            console.log('right');
                        _this.world.removeBody(body);
                    }
                }
            });
            /*
             * 小球下落
             * egert    y坐标变大(正数)
             * p2.js    y坐标减小(正数)
             * 二者之和就是屏幕高度
             */
        }, this);
        egret.lifecycle.onPause = function () {
            egret.ticker.pause();
        };
        egret.lifecycle.onResume = function () {
            egret.ticker.resume();
        };
    };
    Main.prototype.generateBubbles = function () {
        for (var i = 0; i < 200; i++) {
            var circle = this.rigidBody.createCircle(1, Math.random() * 500 + 100, Math.random() * 600 + 400);
            this.addChild(circle[0]);
            circle[1].gravityScale = 0.1;
            circle[1].mass = 0.01;
            circle[1].applyForce([Math.random() * 100 - 50, Math.random() * 50 - 25], circle[1].position);
            // circle[1].type = p2.Body.SLEEPING;
            this.world.addBody(circle[1]);
        }
    };
    Main.prototype.groundAndwall = function () {
        if (!this.debug) {
            this.addChild(this.rigidBody.supportertrect(1, 100, 0, 0, 0));
            this.addChild(this.rigidBody.supportertrect(5, 1, 0, -50, 0));
            this.addChild(this.rigidBody.supportertrect(6, 1, 0, 325, 0));
            this.addChild(this.rigidBody.supportertrect(5, 1, 0, 700, 0));
            this.addChild(this.rigidBody.supportertrect(1, 100, 0, 640, 0));
        }
        else {
            this.addChild(this.rigidBody.supportertrect(1, 100, 0, 0, 0));
            this.addChild(this.rigidBody.supportertrect(100, 1, 0, 0, 0));
            this.addChild(this.rigidBody.supportertrect(1, 100, 0, 640, 0));
        }
    };
    Main.prototype.init = function () {
        //create world
        this.world = new p2.World({
            gravity: [0, -9.82]
        }); //p2.js坐标原点左下角，向上向右（重力为负）
        this.world.sleepMode = p2.World.BODY_SLEEPING;
        PhyUtils.Instance().factor = this.factor;
        PhyUtils.Instance().stageH = egret.MainContext.instance.stage.stageHeight;
        this.rigidBody.factor = this.factor;
        this.rigidBody.world = this.world;
        this.removeChildren();
    };
    Main.prototype.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    return Main;
}(egret.DisplayObjectContainer));
__reflect(Main.prototype, "Main");
//# sourceMappingURL=Main.js.map