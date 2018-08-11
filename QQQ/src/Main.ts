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

        SoundMenager.Shared();

        this.runGame().catch(e => {
            console.log(e);
        })
    }

    private async runGame() {
        await this.loadResource()
        this.createGameScene();
        const result = await RES.getResAsync("description_json")
        // this.startAnimation(result);
        await platform.login();
        const userInfo = await platform.getUserInfo();
        console.log(userInfo);

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


    //准备工作
    debug: boolean = false;
    timeSpan: number = 1500;
    stageH: number = egret.MainContext.instance.stage.stageHeight;
    stageW: number = egret.MainContext.instance.stage.stageWidth;
    circlePosX: number = 100;   //把球摆放在距离屏幕左上角为100,100px位置
    circlePosY: number = 100;
    circleR: number = 120;
    world: p2.World;
    bubbles: p2.Body[];
    // 重力加速度
    gravity: number = 9.82;

    score_left_tf: egret.TextField;
    score_left: number = 100;
    score_right_tf: egret.TextField;
    score_right: number = 100;
    //设置p2.js和egret二者距离的度量衡转换比例
    //p2.js 单位是MKS(米 千克 秒)，egert是像素px
    factor: number = 50;
    //可理解为p2.js的一米长度是egert中屏幕的50px
    private rigidBody: RigidBody = new RigidBody();

    positive_bubbles: Array<any> = [];
    // 所有正在活动的鱼
    actived_fishes: Array<any> = [];
    // 所有激活的引力球
    actived_magnet: Array<any> = [];
    // 按键CD
    keypress_span_l_u: number = 0;
    keypress_span_l_m: number = 0;
    keypress_span_l_d: number = 0;
    keypress_span_r_u: number = 0;
    keypress_span_r_m: number = 0;
    keypress_span_r_d: number = 0;

    /**
    * 创建游戏场景
    */
    private createGameScene(): void {
        this.init();

        this.displayBg();
        this.displayScore();
        this.dispalyCannon();

        SoundMenager.Shared().PlayBGM();
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
        //创建地面
        var groundVsl: egret.Shape = new egret.Shape();
        groundVsl.graphics.beginFill(0xaaccdd);
        groundVsl.graphics.drawRect(0, this.stageH - 10, this.stageW, 10);
        groundVsl.graphics.endFill();
        this.addChild(groundVsl);      //立即加到场景里

        /*
         * 说明：
         * 先创造egert外观更方便，因为创建p2.js body时需要
         * 根据屏幕像素位置(egert位置)计算p2.js body的位置。
         */
        this.touchEnabled = true;
        let angle = 45;
        var timer: egret.Timer = new egret.Timer(this.timeSpan);
        timer.addEventListener(egret.TimerEvent.TIMER, () => {
            //创建圆
            let posX = Math.random() * 700;
            let posY = - 50;

            let circle = this.rigidBody.createCircle(this.circleR, posX, posY);
            this.addChild(circle[0]);
            circle[1].velocity = this.flyJet(angle, 2);
            this.actived_fishes.push(circle[1]);
            this.world.addBody(circle[1]);
        }, this);
        timer.start();

        var mtimer: egret.Timer = new egret.Timer((Math.random() * 5 + 8) * 1000);
        mtimer.addEventListener(egret.TimerEvent.TIMER, () => {
            //创建引力球
            let posX = Math.random() * 700;
            let posY = - Math.random() * 50;

            let circle = this.rigidBody.createMagnet(this.circleR, posX, posY);
            this.addChild(circle[0]);
            circle[1].velocity = this.flyJet(angle, 5);
            circle[1].type = p2.Body.KINEMATIC;
            this.actived_magnet.push(circle[1]);
            this.world.addBody(circle[1]);

            this.world.bodies.forEach(body => {
                let displayobject = body.displays[0];
                if (displayobject.name == "fish") {
                    let posY = this.stageH - body.position[1] * this.factor
                    let x = 0;
                    let y = posY / 2;
                    let _posx = body.position[0] + displayobject.width / 2;
                    let _posy = body.position[0] + displayobject.height / 2;
                    console.log(posY + " [" + x + "," + y + "]");
                    body.applyForce([x, y], body.position);
                }
            });
        }, this);
        mtimer.start();

        this.stage.addEventListener(egret.TouchEvent.TOUCH_END, (e: egret.TouchEvent) => {
            let posX = Math.random() * 700;
            let posY = - Math.random() * 50;

            let circle = this.rigidBody.createCircle(this.circleR, posX, posY);
            this.addChild(circle[0]);
            this.actived_magnet.push(circle[1]);
            this.world.addBody(circle[1]);
        }, this);

        let _timer = new egret.Timer(10);
        _timer.addEventListener(egret.TimerEvent.TIMER, () => {
            let bubbles = this.positive_bubbles.pop();
            if (bubbles) {
                bubbles.forEach(bubble => {
                    let circle = self.rigidBody.createBubble(bubble[0], bubble[1][0], bubble[1][1], 0x33ff66);
                    self.addChildAt(circle[0], 1);
                    circle[1].gravityScale = 0;
                    circle[1].velocity = bubble[2];
                    self.bubbles.push(circle[1]);
                    self.world.addBody(circle[1]);
                });
            }

            this.bubbles.forEach(bubble => {
                bubble.applyForce([0, this.gravity * bubble.getArea()], bubble.position);
            });
        }, this);
        _timer.start();

        let _update = new egret.Timer(50);
        _update.addEventListener(egret.TimerEvent.TIMER, () => {
            this.keypress_span_l_u = this.keypress_span_l_u - 50 / 1000;
            this.keypress_span_l_m = this.keypress_span_l_m - 50 / 1000;
            this.keypress_span_l_d = this.keypress_span_l_d - 50 / 1000;
            this.keypress_span_r_u = this.keypress_span_r_u - 50 / 1000;
            this.keypress_span_r_m = this.keypress_span_r_m - 50 / 1000;
            this.keypress_span_r_d = this.keypress_span_r_d - 50 / 1000;
        }, this);
        _update.start();

        let self = this;
        let press_span = 0.5;
        let bvel = -5;
        document.addEventListener("keydown", function onkeydown(event: KeyboardEvent) {
            let key = event.key;
            let point: number[];
            let arr: Array<any> = [];
            let velocity: number[];
            let _r: number = Math.random() * 30 + 40;
            let nuton = 3 * self.gravity;
            if (key == "a") {
                if (self.keypress_span_l_u > 0)
                    return;
                self.keypress_span_l_u = press_span
                // 左上
                point = [30, 800];
                velocity = [10, 0];
            } else if (key == "q") {
                if (self.keypress_span_l_m > 0)
                    return;
                self.keypress_span_l_m = press_span
                // 左中
                point = [30, 400];
                velocity = [10, 0];
            } else if (key == "z") {
                if (self.keypress_span_l_d > 0)
                    return;
                self.keypress_span_l_d = press_span
                // 左下
                velocity = [0, 0];
                point = [140, 1200];
                arr.push([_r, [140, 1300], self.flyJet(angle, bvel)]);
                arr.push([_r, [140, 1400], self.flyJet(angle, bvel)]);
            } else if (key == "k") {
                if (self.keypress_span_r_u > 0)
                    return;
                self.keypress_span_r_u = press_span
                // 右上
                velocity = [-10, 0];
                point = [self.stageW - 30, 800];
            } else if (key == "o") {
                if (self.keypress_span_r_m > 0)
                    return;
                self.keypress_span_r_m = press_span
                // 右中
                point = [self.stageW - 30, 400];
                velocity = [-10, 0];
            } else if (key == "m") {
                if (self.keypress_span_r_d > 0)
                    return;
                self.keypress_span_r_d = press_span
                // 右下
                velocity = [0, 0];
                point = [830, 1200];
                arr.push([_r, [830, 1300], self.flyJet(angle, bvel)]);
                arr.push([_r, [830, 1400], self.flyJet(angle, bvel)]);
            }
            else {
                return;
            }
            arr.push([_r, point, velocity]);
            self.positive_bubbles.push(arr);
            SoundMenager.Shared().PlayClick();
        });

        // ground and groundAndwall
        this.groundAndwall();
        // this.generateBubbles();
        //第四步：p2.js世界动起来
        egret.Ticker.getInstance().register(function (dt) {
            //p2.js的世界时间流逝
            this.world.step(dt / 1000);

            //看不到的p2物体在下落，egret的外观图片也要时刻更新位置
            this.world.bodies.forEach(body => {
                body = body as p2.Body;
                let displayobject = body.displays[0];
                let flexX = 0;
                let flexY = 0;
                if (displayobject) {
                    if (displayobject.name != "") {
                        // flexX = displayobject.width / 2;
                        //     flexY = displayobject.height / 2;
                    }
                    displayobject.x = body.position[0] * this.factor - flexX;
                    displayobject.y = this.stageH - body.position[1] * this.factor + flexY;

                    // console.log(body.angle);
                    let angle = this.normalizeAngle(body.angle);
                    if (displayobject.name == "fish") {
                        // displayobject.anchorOffsetX = displayobject.width / 2;
                        // displayobject.anchorOffsetY = displayobject.height / 2;

                        displayobject.rotation = angle / Math.PI * 180;
                        // displayobject.anchorOffsetX = 0;
                        // displayobject.anchorOffsetY = 0;
                    }

                    if (displayobject.y > this.stageH + 250) {
                        if (displayobject.name == "fish") {
                            if (displayobject.x < 350)
                                this.score_left--;
                            else
                                this.score_right--;
                        }
                        this.displayScore();
                        this.removeChild(displayobject);
                        this.world.removeBody(body);
                    } else if (displayobject.y < -100) {
                        this.world.removeBody(body);
                        this.removeChild(displayobject);
                    }
                }

                this.actived_magnet.forEach(magnet => {
                    if (magnet.displays[0].y < this.stageH + 50) {
                        this.actived_fishes.forEach(fish => {
                            let gravitation = this.calGravitation(magnet.position, fish.position);
                            fish.applyForce(gravitation, fish.position);
                        });
                    }
                });
                this.removeDisposedAsset(this.actived_magnet);
                this.removeDisposedAsset(this.actived_fishes);
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

    private removeDisposedAsset(arr: Array<p2.Body>) {
        let _temp = [];
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].world == null)
                _temp.push(i);
        }
        _temp.forEach(element => {
            arr.splice(element, 1);
        });
    }

    private flyJet(angle, velocity): number[] {
        return [Math.cos(Math.random() * angle - angle) * velocity, Math.sin(Math.random() * angle - angle) * velocity];
    }

    private calGravitation(p1: number[], p2: number[]): number[] {
        var ab = Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
        var sinE = Math.abs(p1[1] - p2[1]);
        var cosE = Math.abs(p1[0] - p2[0]);
        var F = 2 / Math.pow(ab, 2);

        return [F * cosE, F * sinE];
    }

    private normalizeAngle(angle) {
        angle = angle % (2 * Math.PI);
        if (angle < 0) {
            angle += (2 * Math.PI);
        }
        return angle;
    }

    private dispalyCannon() {
        let sp_l1 = Resources.Instance().Cannon();
        sp_l1.rotation = -180;
        sp_l1.y = 800;
        let sp_l2 = Resources.Instance().Cannon();
        sp_l1.rotation = -180;
        sp_l2.y = 400;
        let sp_r1 = Resources.Instance().Cannon();
        sp_r1.y = 800;
        sp_r1.x = this.stageW;
        let sp_r2 = Resources.Instance().Cannon();
        sp_r2.y = 400;
        sp_r2.x = this.stageW;
        this.addChild(sp_l1);
        this.addChild(sp_l2);
        this.addChild(sp_r1);
        this.addChild(sp_r2);
    }

    private displayBg() {
        var w = egret.MainContext.instance.stage.stageWidth;
        var h = egret.MainContext.instance.stage.stageHeight;
        var img: egret.Bitmap = new egret.Bitmap();
        img.texture = RES.getRes('background_png');
        img.width = w;
        img.height = h;
        this.addChild(img);

        var t_l: egret.Bitmap = new egret.Bitmap();
        t_l.texture = RES.getRes('t_left_png');
        t_l.width = 285;
        t_l.height = 333;
        t_l.x = 121;
        t_l.y = 950;
        this.addChildAt(t_l, 1);

        var t_r: egret.Bitmap = new egret.Bitmap();
        t_r.texture = RES.getRes('t_right_png');
        t_r.width = 285;
        t_r.height = 333;
        t_r.x = 584;
        t_r.y = 950;
        this.addChildAt(t_r, 1);
    }

    private displayScore() {
        if (!this.score_left_tf) {
            this.score_left_tf = new egret.TextField();
            this.score_left_tf.x = 100;
            this.score_left_tf.y = 100;
            this.addChild(this.score_left_tf);
        }

        if (!this.score_right_tf) {
            this.score_right_tf = new egret.TextField();
            this.score_right_tf.x = 500;
            this.score_right_tf.y = 100;
            this.addChild(this.score_right_tf);
        }
        this.score_right_tf.text = this.score_right.toString();
        this.score_left_tf.text = this.score_left.toString();
    }

    private generateBubbles() {
        for (let i: number = 0; i < 500; i++) {
            let circle = this.rigidBody.createCircle(1, 320, Math.random() * 1000);
            this.addChild(circle[0]);
            circle[1].gravityScale = 0.01;
            circle[1].mass = 1;
            this.bubbles.push(circle[1]);
            // circle[1].type = p2.Body.SLEEPING;
            this.world.addBody(circle[1]);
        }
    }

    private groundAndwall() {
        if (!this.debug) {
            this.addChild(this.rigidBody.supportertrect(1, 100, 0, 0, 0));
            this.addChild(this.rigidBody.supportertrect(5, 1, 0, 0, 0));
            this.addChild(this.rigidBody.supportertrect(8, 1, 0, this.stageW / 2, 0));
            this.addChild(this.rigidBody.supportertrect(5, 1, 0, this.stageW, 0));
            this.addChild(this.rigidBody.supportertrect(1, 100, 0, this.stageW, 0));
        }
        else {
            this.addChild(this.rigidBody.supportertrect(1, 100, 0, 0, 0));
            this.addChild(this.rigidBody.supportertrect(100, 1, 0, 0, 0));
            this.addChild(this.rigidBody.supportertrect(1, 100, 0, this.stageW, 0));
        }
    }

    private init() {
        //create world
        this.world = new p2.World({
            gravity: [0, -this.gravity]
        });         //p2.js坐标原点左下角，向上向右（重力为负）
        this.world.sleepMode = p2.World.BODY_SLEEPING;
        PhyUtils.Instance().factor = this.factor;
        PhyUtils.Instance().stageH = egret.MainContext.instance.stage.stageHeight;
        this.rigidBody.factor = this.factor;
        this.rigidBody.world = this.world;
        this.bubbles = new Array<p2.Body>();
        this.removeChildren();
    }

    public createBitmapByName(name: string): egret.Bitmap {
        var result: egret.Bitmap = new egret.Bitmap();
        var texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }
}
