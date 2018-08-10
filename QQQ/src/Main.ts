class Main extends egret.DisplayObjectContainer {

    /**
    * 加载进度界面
    */
    private loadingView: LoadingUI;

    private _gameOverPanel: GameOverPanel;
    private _gameStartPanel: GameStartPanel;
    private _gameExplainPanel: GameExplainPanel;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);

    }

    private onAddToStage(event: egret.Event) {
        //设置加载进度界面
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);

        //初始化Resource资源加载库
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/resource.json", "resource/");
    }

    /**
    * 配置文件加载完成,开始预加载preload资源组。
    */
    private onConfigComplete(event: RES.ResourceEvent): void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.loadGroup("preload");
    }

    /**
    * preload资源组加载完成
    */
    private onResourceLoadComplete(event: RES.ResourceEvent): void {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            this.createGameScene();

        }
    }

    /**
    * preload资源组加载进度
    */

    private onResourceProgress(event: RES.ResourceEvent): void {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }

    private _isDebug: boolean = false;
    private factor: number = 50;
    private level_num: number = 0;//关卡序号
    private world: p2.World;
    private success_num = new Array(16);//level_num关卡中的所有物体（包括支撑物体）
    private sleep_num = new Array(16);//level_num关卡中的移动物体数
    private beta_gamma: number = 0;//手机倾斜角
    private rigidBody: RigidBody = new RigidBody();
    /**
    * 创建游戏场景
    */

    private createGameScene(): void {
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

        //准备工作
        var stageH: number = egret.MainContext.instance.stage.stageHeight;
        var stageW: number = egret.MainContext.instance.stage.stageHeight;
        var circlePosX: number = 100;   //把球摆放在距离屏幕左上角为100,100px位置
        var circlePosY: number = 100;
        var circleR: number = 50;

        //设置p2.js和egret二者距离的度量衡转换比例
        //p2.js 单位是MKS(米 千克 秒)，egert是像素px
        var factor: number = 50;
        //可理解为p2.js的一米长度是egert中屏幕的50px
        //创建地面
        var groundVsl: egret.Shape = new egret.Shape();
        groundVsl.graphics.beginFill(0xaaccdd);
        groundVsl.graphics.drawRect(0, stageH - 10, stageW, 10);
        groundVsl.graphics.endFill();
        this.addChild(groundVsl);      //立即加到场景里

        //第二步：创建独立的p2物理世界
        //create world
        this.world = new p2.World({
            gravity: [0, -9.82]
        });         //p2.js坐标原点左下角，向上向右（重力为负）
        this.world.sleepMode = p2.World.BODY_SLEEPING;

        /*
         * 说明：
         * 先创造egert外观更方便，因为创建p2.js body时需要
         * 根据屏幕像素位置(egert位置)计算p2.js body的位置。
         */
        this.touchEnabled = true;
        var timer: egret.Timer = new egret.Timer(200);
        timer.addEventListener(egret.TimerEvent.TIMER, () => {

            //创建圆
            let posX = Math.random() * 700;
            let posY = - Math.random() * 50;
            var circleVsl: egret.Shape = new egret.Shape();
            circleVsl.graphics.beginFill(0xffffff);
            circleVsl.graphics.drawCircle(0, 0, circleR);//千万不要填写x,y坐标为非零值，后果自负
            circleVsl.graphics.endFill();
            circleVsl.x = posX;
            circleVsl.y = posY;
            this.addChild(circleVsl);      //立即加到场景里

            //将egret坐标的100，100像素转换为p2.js中的米(注意Y方向)
            var circlePosXInP2: number = PhyUtils.Instance().extendX(posX);
            var circlePosYInP2: number = PhyUtils.Instance().extendY(posY);
            var circleRInP2: number = circleR / factor;     //半径也要转换

            var circleBody: p2.Body = new p2.Body({
                mass: 1,
                position: [circlePosXInP2, circlePosYInP2]    //重中之重
            });
            var circleShape: p2.Circle = new p2.Circle({
                radius: circleRInP2
            });
            circleBody.addShape(circleShape);
            this.world.addBody(circleBody);
            circleBody.displays = [circleVsl];

        }, this);
        timer.start();

        this.stage.addEventListener(egret.TouchEvent.TOUCH_END, (e: egret.TouchEvent) => {
            this.world.bodies.forEach(body => {
                let posY = stageH - body.position[1] * factor
                {
                    let x = Math.random() * 200 - 100;
                    let y = posY / 2;
                    body.applyForce([x, y], body.position);
                }
            })
        }, this);

        // ground and groundAndwall
        this.groundAndwall();

        //第三步：将p2.js物理引擎和egret关联
        //        groundBody.displays = [groundVsl];

        //第四步：p2.js世界动起来
        egret.Ticker.getInstance().register(function (dt) {
            //p2.js的世界时间流逝
            this.world.step(dt / 1000);

            //看不到的p2物体在下落，egret的外观图片也要时刻更新位置
            this.world.bodies.forEach(body => {
                if (body.displays) {
                    body.displays[0].x = body.position[0] * factor;
                    body.displays[0].y = stageH - body.position[1] * factor;

                    if (body.displays[0].y > stageH + 100) {
                        if (body.displays[0].x < 350)
                            console.log('left');
                        else
                            console.log('right');
                        this.world.removeBody(body);
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
        egret.lifecycle.onPause = () => {
            egret.ticker.pause();
        }

        egret.lifecycle.onResume = () => {
            egret.ticker.resume();
        }
    }
    private init() {
        PhyUtils.Instance().factor = this.factor;
        PhyUtils.Instance().stageH = egret.MainContext.instance.stage.stageHeight;
        this.removeChildren();
    }

    private groundAndwall() {
        this.rigidBody.factor = this.factor;
        this.rigidBody.world = this.world;
        this.addChild(this.rigidBody.supportertrect(1, 100, 0, 0, 0));
        this.addChild(this.rigidBody.supportertrect(5, 1, 0, -50, 0));
        this.addChild(this.rigidBody.supportertrect(6, 1, 0, 325, 0));
        this.addChild(this.rigidBody.supportertrect(5, 1, 0, 700, 0));
        this.addChild(this.rigidBody.supportertrect(1, 100, 0, 640, 0));
    }

    private gameover() {
        this._gameOverPanel = new GameOverPanel();
        this._gameOverPanel.addEventListener("restartGame", this.restartGame, this);
        this._gameOverPanel.addEventListener("backGame", this.backGame, this);
        this.addChild(this._gameOverPanel);
    }
    private gamebegin() {
        this._gameStartPanel = new GameStartPanel();
        this._gameStartPanel.addEventListener("startGame", this.startGame, this);
        this._gameStartPanel.addEventListener("explainGame", this.explainGame, this);
        this.stage.addChild(this._gameStartPanel);
    }
    private gameexplain() {
        this._gameExplainPanel = new GameExplainPanel();
        this._gameExplainPanel.addEventListener("startGame", this.startGame, this);
        this.addChild(this._gameExplainPanel);
    }
    private restartGame() {
        this.level(this.level_num);
    }
    private backGame() {
        this.level_num = 0;
        this.level(this.level_num);
    }
    private startGame() {
        this.level_num = 1;
        Data.score = 1;
        this.level(1);
    }
    private explainGame() {
        this.level(-1);
    }
    //0为开始界面，-1为游戏介绍界面，-2为游戏结束界面
    private level(level_num: number) {
        this.init();
        if (level_num == -2) {
            this.level_m2();
        }
        if (level_num == -1) {
            this.level_m1();
        }
        if (level_num == 0) {
            this.level_0();
        }
        if (level_num == 1) {
            this.level_1();
        }
        if (level_num == 2) {
            this.level_2();
        }
        if (level_num == 3) {
            this.level_3();
        }
        if (level_num == 4) {
            this.level_4();
        }
        if (level_num == 5) {
            this.level_5();
        }
        if (level_num == 6) {
            this.level_6();
        }
        if (level_num == 7) {
            this.level_7();
        }
        if (level_num == 8) {
            this.level_8();
        }
        if (level_num == 9) {
            this.level_9();
        }
        if (level_num == 10) {
            this.level_10();
        }
        if (level_num == 11) {
            this.level_11();
        }
        if (level_num == 12) {
            this.level_12();
        }
        if (level_num == 13) {
            this.level_13();
        }
        if (level_num == 14) {
            this.level_14();
        }
        if (level_num == 15) {
            this.level_15();
        }
        if (level_num == 16) {
            this.level_16();
        }
    }
    private level_m2() {
        this.gameover();
    }
    private level_m1() {
        this.gameexplain();
    }
    private level_0() {
        this.gamebegin();
    }
    private level_1() {
        this.ground();
        this.supportertrect(1.5, 1.5, 0, 240, 100);
        this.creatrect(125, 125, 0, 50, 100);
        this.creatrect(100, 100, 0, 165, 100);
        this.creatrect(75, 75, 0, 255, 100);
        this.creatrect(50, 50, 0, 320, 100);
        this.creatrect(50, 50, 0, 372, 100);
    }


    private level_2() {
        this.ground();
        this.supportertrect(1, 3, 0, 120, 100);
        this.supportertrect(1, 3, 0, 360, 100);
        this.creatrect_candy(250, 70, 0, 340, 50);
        this.creattriangle(150, -45, 350, 175);
        this.creatrect(100, 100, 0, 50, 50);
        this.creatrect(100, 100, 0, 50, 160);
        this.creatrect(100, 100, 0, 50, 270);
        this.creatrect(100, 100, 0, 160, 50);
        this.creatrect(100, 100, 0, 160, 160);
        this.creatrect(100, 100, 0, 160, 270);
    }
    private level_3() {
        this.ground();
        this.supportertrect(8, 1, 0, 240, 250);
        this.creattriangle(100, -45, 400, 50);
        this.creattriangle(100, -45, 300, 125);
        this.creattriangle(100, -45, 400, 200);
        this.creatcircle(100, 50, 160);
        this.creatcircle(100, 160, 160);
        this.creatrect(100, 100, 45, 50, 50);
        this.creatrect(100, 100, -45, 160, 50);
    }
    private level_4() {
        this.ground();
        this.supportertrect(1, 1, 0, 120, 100);
        this.supportertrect(1, 1, 0, 320, 100);
        this.creatrect_candy(350, 20, 0, 180, 200);
        this.creatrect_candy(250, 20, 0, 180, 250);
        this.creatrect(45, 45, 0, 50, 50);
        this.creatrect(45, 45, 0, 100, 50);
        this.creatrect(45, 45, 0, 150, 50);
        this.creatcircle(100, 50, 120);
        this.creatcircle(100, 160, 120);
        this.creatcircle(100, 270, 120);
        this.creatcircle(100, 380, 120);
        this.creattriangle(100, -45, 400, 250);
    }
    private level_5() {
        this.ground();
        this.supportertrect(6, 1, 0, 220, 200);
        this.creattriangle(100, -45, 50, 70);
        this.creattriangle(100, -45, 150, 70);
        this.creattriangle(100, -45, 250, 70);
        this.creattriangle(100, 135, 400, 50);
    }
    private level_6() {
        this.ground();
        this.supportertrect(4, 1, 0, 220, 200);
        this.creatrect_candy(300, 50, 0, 200, 250);
        this.creattriangle(100, -45, 50, 70);
        this.creattriangle(150, -45, 200, 70);
        this.creattriangle(100, 225, 400, 200);
        this.creattriangle(100, 45, 400, 70);
        this.creatcircle(100, 50, 160);
        this.creatcircle(100, 160, 160);
    }
    private level_7() {
        this.ground();
        this.supportertrect(6, 1, 0, 220, 200);
        this.creatcircle(95, 50, 200);
        this.creatcircle(95, 150, 200);
        this.creatcircle(95, 50, 300);
        this.creatcircle(95, 150, 300);
        this.creatrect_candy(300, 50, 0, 150, 125);
        this.creatrect(95, 95, 0, 50, 50);
        this.creatrect(95, 95, 0, 150, 50);
        this.creatrect(95, 95, 0, 250, 50);
        this.creatrect(95, 95, 0, 350, 50);
        this.creattriangle(180, -45, 320, 250);
    }
    private level_8() {
        this.ground();
        this.supportercircle(25, 250, 170);
        this.supportercircle(25, 65, 170);
        this.supportercircle(25, 435, 170);
        this.creatrect_candy(185, 15, 0, 370, 230);
        this.creatrect_candy(185, 15, 0, 370, 250);
        this.creattriangle(120, -45, 90, 50);
        this.creattriangle(120, -45, 250, 50);
        this.creatcircle(120, 50, 150);
        this.creatcircle(120, 180, 150);
        this.creatcircle(120, 310, 150);
    }
    private level_9() {
        this.ground();
        this.supportercircle(30, 250, 250);
        this.supportercircle(30, 50, 250);
        this.supportercircle(30, 150, 150);
        this.supportercircle(30, 350, 150);
        this.supportercircle(30, 450, 250);
        this.creattriangle(105, 180, 50, 70);
        this.creattriangle(105, 90, 50, 170);
        this.creattriangle(105, 180, 150, 70);
        this.creattriangle(105, 90, 150, 170);
        this.creattriangle(150, -45, 320, 70);
        this.creattriangle(150, -45, 320, 170);
    }

    private level_10() {
        this.ground();
        this.supportertrect(2, 2, 0, 250, 100);
        this.supportercircle(30, 200, 350);
        this.supportercircle(30, 300, 250);
        this.supportercircle(30, 400, 150);
        this.creattriangle(110, 180, 50, 50);
        this.creattriangle(110, 180, 50, 150);
        this.creatrect(220, 88, 0, 210, 50);
        this.creatrect(230, 98, 0, 210, 150);
        this.creatcircle(80, 360, 50);
        this.creatcircle(80, 360, 150);
        this.creattriangle(80, -45, 450, 50);
    }

    private level_11() {
        this.ground();
        this.supportertrect(2, 1, 0, 80, 250);
        this.supportertrect(2, 1, 0, 400, 250);
        this.supportertrect(2, 1, 0, 120, 150);
        this.supportertrect(2, 1, 0, 360, 150);
        this.creattriangle(100, -45, 400, 50);
        this.creattriangle(100, -45, 400, 125);
        this.creattriangle(100, -45, 400, 200);
        this.creatcircle(100, 50, 160);
        this.creatcircle(100, 160, 160);
        this.creatcircle(100, 270, 160);
        this.creatrect(100, 100, 0, 50, 50);
        this.creatrect(100, 100, 0, 160, 50);
    }
    private level_12() {
        this.ground();
        this.supportertrect(3, 3.5, 55, 75, 200);
        this.supportertrect(3, 3.5, -55, 425, 200);
        this.creatcircle(121, 50, 100);
        this.creatcircle(121, 150, 100);
        this.creatcircle(100, 250, 100);
        this.creatcircle(100, 320, 100);
        this.creatrect(95, 80, 0, 400, 100);
    }
    private level_13() {
        this.ground();
        this.supportertrect(4.5, 0.7, 12, 120, 200);
        this.supportertrect(4.5, 0.7, -12, 360, 200);
        this.creatcircle(45, 50, 50);
        this.creatcircle(45, 100, 50);
        this.creatcircle(45, 150, 50);
        this.creatcircle(45, 200, 50);
        this.creatcircle(45, 250, 50);
        this.creatcircle(45, 300, 50);
        this.creatcircle(45, 350, 50);
        this.creatcircle(45, 400, 50);
        this.creatrect(60, 60, 0, 50, 120);
        this.creatrect(60, 60, 0, 150, 120);
        this.creattriangle(120, -45, 250, 150);
    }

    private level_14() {
        this.ground();
        this.supportertrect(0.5, 0.5, 0, 120, 100);
        this.supportertrect(0.5, 0.5, 0, 360, 100);
        this.creattriangle(150, -45, 350, 175);
        this.creatrect_candy(200, 25, 90, 30, 80);
        this.creatrect_candy(200, 25, 90, 70, 80);
        this.creatrect_candy(200, 25, 90, 100, 80);
        this.creatrect_candy(200, 25, 90, 140, 80);
        this.creatrect(50, 50, 0, 200, 150);
        this.creatrect(50, 50, 0, 200, 200);
        this.creatrect_candy(260, 30, 0, 300, 50);
        this.creatrect_candy(260, 30, 0, 300, 90);
        this.creatcircle(200, 100, 280);
    }
    private level_15() {
        this.ground();
        this.supportercircle(25, 240, 100);
        this.supportercircle(25, 240, 50);
        this.creatrect(50, 50, 0, 50, 80);
        this.creatrect(50, 50, 0, 100, 80);
        this.creatrect_candy(250, 25.2, 0, 350, 50);
        this.creattriangle(100, -45, 400, 250);
        this.creatrect(170, 170, 0, 80, 250);
        this.creatrect(120, 120, 0, 250, 250);
    }


    private level_16() {
        this.gameoverground();
    }

    private ground() {
        var img: egret.Bitmap = new egret.Bitmap();
        img.texture = RES.getRes('background_png');
        //        img.fillMode = egret.BitmapFillMode.REPEAT;
        img.width = this.stage.stageWidth;
        img.height = this.stage.stageHeight;
        this.addChild(img);
    }
    private gameoverground() {
        var img: egret.Bitmap = new egret.Bitmap();
        img.texture = RES.getRes('gameOverBG_png');
        //        img.fillMode = egret.BitmapFillMode.REPEAT;
        img.width = this.stage.stageWidth;
        img.height = this.stage.stageWidth;
        img.anchorOffsetY = this.stage.stageWidth / 2;
        img.y = this.stage.stageHeight / 2;
        this.addChild(img);
        img.touchEnabled = true;
        img.addEventListener(egret.TouchEvent.TOUCH_END, this.backGame, this);
    }
    private supportertrect(_width: number, _height: number, _rotation: number, _x: number, _y: number) {
        var supporterShape: p2.Shape = new p2.Box({ width: _width, height: _height });
        var supporterBody: p2.Body = new p2.Body({ mass: 0, position: [_x / this.factor, _y / this.factor], angle: Math.PI * ((_rotation) / 180), angularVelocity: 0 });
        supporterBody.addShape(supporterShape);
        this.world.addBody(supporterBody);
        var display: egret.DisplayObject = this.createBitmapByName("rect2_png");
        display.width = (<p2.Box>supporterShape).width * this.factor;
        display.height = (<p2.Box>supporterShape).height * this.factor;
        display.anchorOffsetX = display.width / 2;
        display.anchorOffsetY = display.height / 2;
        supporterBody.displays = [display];
        this.addChild(display);
    }
    private supportertriangle(_sidelenght: number, _rotation: number, _x: number, _y: number) {
        var center1: number[] = new Array(0, 0);
        var mousePos_11: number[] = new Array(0, _sidelenght / this.factor);
        var mousePos_21: number[] = new Array(_sidelenght / this.factor, _sidelenght / this.factor);
        var mousePos_31: number[] = new Array(0, 0);
        var points1: number[][] = new Array();
        p2.vec2.centroid(center1, mousePos_11, mousePos_21, mousePos_31);
        p2.vec2.subtract(mousePos_11, mousePos_11, center1);
        p2.vec2.subtract(mousePos_21, mousePos_21, center1);
        p2.vec2.subtract(mousePos_31, mousePos_31, center1);
        points1.push(mousePos_11);
        points1.push(mousePos_21);
        points1.push(mousePos_31);

        var supporterBody: p2.Body = new p2.Body({ mass: 0, position: [_x / this.factor, _y / this.factor], angle: Math.PI * ((_rotation) / 180), angularVelocity: 0 });
        supporterBody.fromPolygon(points1, { optimalDecomp: false });
        this.world.addBody(supporterBody);

        var items1: egret.Bitmap = new egret.Bitmap();
        items1.texture = RES.getRes('triangle_png');
        items1.width = _sidelenght;
        items1.height = _sidelenght;
        items1.rotation = -_rotation;
        items1.x = _x;
        items1.y = _y;
        items1.anchorOffsetX = center1[0] * this.factor;
        items1.anchorOffsetY = items1.height - center1[1] * this.factor;
        supporterBody.displays = [items1];
        this.addChild(items1);
    }
    private supportercircle(_radius: number, _x: number, _y: number) {
        var supporterShape: p2.Shape = new p2.Circle({ radius: ((_radius / 2) / this.factor) });
        var supporterBody: p2.Body = new p2.Body({ mass: 0, position: [_x / this.factor, _y / this.factor], angularVelocity: 0 });
        supporterBody.addShape(supporterShape);
        this.world.addBody(supporterBody);
        var display: egret.DisplayObject = this.createBitmapByName("circle2_png");
        display.width = _radius;
        display.height = _radius;
        display.x = _x;
        display.y = _y;
        display.anchorOffsetX = display.width / 2;
        display.anchorOffsetY = display.height / 2;
        supporterBody.displays = [display];
        this.addChild(display);
    }
    private creattriangle(_sidelenght: number, _rotation: number, _x: number, _y: number) {
        var items1: egret.Bitmap = new egret.Bitmap();
        items1.texture = RES.getRes('triangle_png');
        items1.width = _sidelenght;
        items1.height = _sidelenght;
        items1.rotation = -_rotation;
        var center1: number[] = new Array(0, 0);
        var mousePos_11: number[] = new Array(0, _sidelenght / this.factor);
        var mousePos_21: number[] = new Array(_sidelenght / this.factor, _sidelenght / this.factor);
        var mousePos_31: number[] = new Array(0, 0);
        var points1: number[][] = new Array();
        p2.vec2.centroid(center1, mousePos_11, mousePos_21, mousePos_31);
        p2.vec2.subtract(mousePos_11, mousePos_11, center1);
        p2.vec2.subtract(mousePos_21, mousePos_21, center1);
        p2.vec2.subtract(mousePos_31, mousePos_31, center1);
        points1.push(mousePos_11);
        points1.push(mousePos_21);
        points1.push(mousePos_31);
        items1.x = _x;
        items1.y = _y;
        items1.anchorOffsetX = center1[0] * this.factor;
        items1.anchorOffsetY = items1.height - center1[1] * this.factor;
        this.addChild(items1);
        items1.touchEnabled = true;
        items1.addEventListener(egret.TouchEvent.TOUCH_BEGIN, startMove1, this);
        items1.addEventListener(egret.TouchEvent.TOUCH_END, stopMove1, this);
        var draggedObject1: egret.Shape;
        var offsetX1: number;
        var offsetY1: number;
        function startMove1(e: egret.TouchEvent): void {
            //把手指按到的对象记录下来
            draggedObject1 = e.currentTarget;
            //计算手指和要拖动的对象的距离
            offsetX1 = e.stageX - draggedObject1.x;
            offsetY1 = e.stageY - draggedObject1.y;
            //把触摸的对象放在显示列表的顶层
            this.addChild(draggedObject1);
            //手指在屏幕上移动，会触发 onMove 方法
            this.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, onMove1, this);
        }
        function stopMove1(e: egret.TouchEvent) {
            //            console.log(22);
            //手指离开屏幕，移除手指移动的监听
            this.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, onMove1, this);
            draggedObject1 = e.currentTarget;

            var positionX: number = draggedObject1.x / this.factor;
            var positionY: number = (this.stage.stageHeight - draggedObject1.y) / this.factor;
            var boxBody: p2.Body = new p2.Body({ mass: 1, position: [positionX, positionY], angle: Math.PI * ((_rotation) / 180) });
            boxBody.fromPolygon(points1, { optimalDecomp: false });
            this.world.addBody(boxBody);
            boxBody.displays = [e.currentTarget];
            e.currentTarget.touchEnabled = false;
            //            var sound:egret.Sound = RES.getRes( "bgm_1" ); 
            //            var channel:egret.SoundChannel = sound.play(0,1);
        }
        function onMove1(e: egret.TouchEvent): void {
            //通过计算手指在屏幕上的位置，计算当前对象的坐标，达到跟随手指移动的效果
            draggedObject1.x = e.stageX - offsetX1;
            draggedObject1.y = e.stageY - offsetY1;
        }
    }
    private creatrect(_width: number, _height: number, _rotation: number, _x: number, _y: number) {
        var display: egret.DisplayObject = this.createBitmapByName('rect_png')
        display.width = _width;
        display.height = _height;
        display.x = _x;
        display.y = _y;
        display.rotation = -_rotation;
        display.anchorOffsetX = display.width / 2;
        display.anchorOffsetY = display.height / 2;
        this.addChild(display);
        display.touchEnabled = true;
        display.addEventListener(egret.TouchEvent.TOUCH_BEGIN, startMove, this);
        display.addEventListener(egret.TouchEvent.TOUCH_END, stopMove, this);
        var draggedObject: egret.Shape;
        var offsetX: number;
        var offsetY: number;
        function startMove(e: egret.TouchEvent): void {
            //把手指按到的对象记录下来
            draggedObject = e.currentTarget;
            //计算手指和要拖动的对象的距离
            offsetX = e.stageX - draggedObject.x;
            offsetY = e.stageY - draggedObject.y;
            //把触摸的对象放在显示列表的顶层
            this.addChild(draggedObject);
            //手指在屏幕上移动，会触发 onMove 方法
            this.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, onMove, this);
        }
        function stopMove(e: egret.TouchEvent) {
            //            console.log(22);
            //手指离开屏幕，移除手指移动的监听
            this.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, onMove, this);
            draggedObject = e.currentTarget;

            var positionX: number = draggedObject.x / this.factor;
            var positionY: number = (this.stage.stageHeight - draggedObject.y) / this.factor;
            var boxShape: p2.Shape = new p2.Box({ width: _width / this.factor, height: _height / this.factor });
            var boxBody: p2.Body = new p2.Body({ mass: 1, position: [positionX, positionY], angle: Math.PI * ((_rotation) / 180), angularVelocity: 0 });
            boxBody.addShape(boxShape);
            this.world.addBody(boxBody);
            boxBody.displays = [e.currentTarget];
            e.currentTarget.touchEnabled = false;
            //            var sound:egret.Sound = RES.getRes( "bgm_2" ); 
            //            var channel:egret.SoundChannel = sound.play(0,1);
        }
        function onMove(e: egret.TouchEvent): void {
            //通过计算手指在屏幕上的位置，计算当前对象的坐标，达到跟随手指移动的效果
            draggedObject.x = e.stageX - offsetX;
            draggedObject.y = e.stageY - offsetY;
        }
    }
    private creatrect_candy(_width: number, _height: number, _rotation: number, _x: number, _y: number) {
        var display: egret.DisplayObject = this.createBitmapByName('candy_png')
        display.width = _width;
        display.height = _height;
        display.x = _x;
        display.y = _y;
        display.rotation = -_rotation;
        display.anchorOffsetX = display.width / 2;
        display.anchorOffsetY = display.height / 2;
        this.addChild(display);
        display.touchEnabled = true;
        display.addEventListener(egret.TouchEvent.TOUCH_BEGIN, startMove, this);
        display.addEventListener(egret.TouchEvent.TOUCH_END, stopMove, this);
        var draggedObject: egret.Shape;
        var offsetX: number;
        var offsetY: number;
        function startMove(e: egret.TouchEvent): void {
            //把手指按到的对象记录下来
            draggedObject = e.currentTarget;
            //计算手指和要拖动的对象的距离
            offsetX = e.stageX - draggedObject.x;
            offsetY = e.stageY - draggedObject.y;
            //把触摸的对象放在显示列表的顶层
            this.addChild(draggedObject);
            //手指在屏幕上移动，会触发 onMove 方法
            this.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, onMove, this);
        }
        function stopMove(e: egret.TouchEvent) {
            //            console.log(22);
            //手指离开屏幕，移除手指移动的监听
            this.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, onMove, this);
            draggedObject = e.currentTarget;

            var positionX: number = draggedObject.x / this.factor;
            var positionY: number = (this.stage.stageHeight - draggedObject.y) / this.factor;
            var boxShape: p2.Shape = new p2.Box({ width: _width / this.factor, height: _height / this.factor });
            var boxBody: p2.Body = new p2.Body({ mass: 1, position: [positionX, positionY], angle: Math.PI * ((_rotation) / 180), angularVelocity: 0 });
            boxBody.addShape(boxShape);
            this.world.addBody(boxBody);
            boxBody.displays = [e.currentTarget];
            e.currentTarget.touchEnabled = false;
            //            var sound:egret.Sound = RES.getRes( "bgm_2" ); 
            //            var channel:egret.SoundChannel = sound.play(0,1);
        }
        function onMove(e: egret.TouchEvent): void {
            //通过计算手指在屏幕上的位置，计算当前对象的坐标，达到跟随手指移动的效果
            draggedObject.x = e.stageX - offsetX;
            draggedObject.y = e.stageY - offsetY;
        }
    }
    private creatcircle(_radius: number, _x: number, _y: number) {
        var display1: egret.DisplayObject = this.createBitmapByName('circle_png')
        display1.width = _radius;
        display1.height = _radius;
        display1.x = _x;
        display1.y = _y;
        display1.anchorOffsetX = display1.width / 2;
        display1.anchorOffsetY = display1.height / 2;
        this.addChild(display1);
        display1.touchEnabled = true;
        display1.addEventListener(egret.TouchEvent.TOUCH_BEGIN, startMove2, this);
        display1.addEventListener(egret.TouchEvent.TOUCH_END, stopMove2, this);
        var draggedObject: egret.Shape;
        var offsetX: number;
        var offsetY: number;
        function startMove2(e: egret.TouchEvent): void {
            //把手指按到的对象记录下来
            draggedObject = e.currentTarget;
            //计算手指和要拖动的对象的距离
            offsetX = e.stageX - draggedObject.x;
            offsetY = e.stageY - draggedObject.y;
            //把触摸的对象放在显示列表的顶层
            this.addChild(draggedObject);
            //手指在屏幕上移动，会触发 onMove 方法
            this.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, onMove2, this);
        }

        function stopMove2(e: egret.TouchEvent) {
            //            console.log(22);
            //手指离开屏幕，移除手指移动的监听
            this.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, onMove2, this);
            draggedObject = e.currentTarget;

            var positionX: number = draggedObject.x / this.factor;
            var positionY: number = (this.stage.stageHeight - draggedObject.y) / this.factor;
            var boxShape: p2.Shape = new p2.Circle({ radius: ((_radius / 2) / this.factor) });
            var boxBody: p2.Body = new p2.Body({ mass: 1, position: [positionX, positionY] });
            boxBody.addShape(boxShape);
            this.world.addBody(boxBody);
            boxBody.displays = [e.currentTarget];
            e.currentTarget.touchEnabled = false;
            //            var sound:egret.Sound = RES.getRes( "bgm_3" ); 
            //            var channel:egret.SoundChannel = sound.play(0,1);
        }
        function onMove2(e: egret.TouchEvent): void {
            //通过计算手指在屏幕上的位置，计算当前对象的坐标，达到跟随手指移动的效果
            draggedObject.x = e.stageX - offsetX;
            draggedObject.y = e.stageY - offsetY;
        }
    }

    public createBitmapByName(name: string): egret.Bitmap {
        var result: egret.Bitmap = new egret.Bitmap();
        var texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }
    private onOrientation(e: egret.OrientationEvent) {
        this.beta_gamma = Math.round(e.gamma);
        //        this.label.text =
        //            "方向: nalpha:" + e.alpha
        //            + "\n,nbeta:" + e.beta
        //        + "\n,ngamma:" + this.beta_gamma
        //        + "\n,beta_gamma:" + this.beta_gamma / 45;
    }
}
