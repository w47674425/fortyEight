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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        //准备工作
        _this.debug = false;
        _this.timeSpan = 1500;
        _this.stageH = egret.MainContext.instance.stage.stageHeight;
        _this.stageW = egret.MainContext.instance.stage.stageWidth;
        _this.circlePosX = 100; //把球摆放在距离屏幕左上角为100,100px位置
        _this.circlePosY = 100;
        _this.circleR = 120;
        // 重力加速度
        _this.gravity = 9.82;
        _this.score_left = 100;
        _this.score_right = 100;
        //设置p2.js和egret二者距离的度量衡转换比例
        //p2.js 单位是MKS(米 千克 秒)，egert是像素px
        _this.factor = 50;
        //可理解为p2.js的一米长度是egert中屏幕的50px
        _this.rigidBody = new RigidBody();
        _this.positive_bubbles = [];
        // 所有正在活动的鱼
        _this.actived_fishes = [];
        // 所有激活的引力球
        _this.actived_magnet = [];
        // 按键CD
        _this.keypress_span_l_u = 0;
        _this.keypress_span_l_m = 0;
        _this.keypress_span_l_d = 0;
        _this.keypress_span_r_u = 0;
        _this.keypress_span_r_m = 0;
        _this.keypress_span_r_d = 0;
        return _this;
    }
    Main.prototype.createChildren = function () {
        _super.prototype.createChildren.call(this);
        egret.lifecycle.addLifecycleListener(function (context) {
            // custom lifecycle plugin
        });
        egret.lifecycle.onPause = function () {
            egret.ticker.pause();
        };
        egret.lifecycle.onResume = function () {
            egret.ticker.resume();
        };
        //inject the custom material parser
        //注入自定义的素材解析器
        var assetAdapter = new AssetAdapter();
        egret.registerImplementation("eui.IAssetAdapter", assetAdapter);
        egret.registerImplementation("eui.IThemeAdapter", new ThemeAdapter());
        SoundMenager.Shared();
        this.runGame().catch(function (e) {
            console.log(e);
        });
    };
    Main.prototype.runGame = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, userInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadResource()];
                    case 1:
                        _a.sent();
                        this.createGameScene();
                        return [4 /*yield*/, RES.getResAsync("description_json")
                            // this.startAnimation(result);
                        ];
                    case 2:
                        result = _a.sent();
                        // this.startAnimation(result);
                        return [4 /*yield*/, platform.login()];
                    case 3:
                        // this.startAnimation(result);
                        _a.sent();
                        return [4 /*yield*/, platform.getUserInfo()];
                    case 4:
                        userInfo = _a.sent();
                        console.log(userInfo);
                        return [2 /*return*/];
                }
            });
        });
    };
    Main.prototype.loadResource = function () {
        return __awaiter(this, void 0, void 0, function () {
            var loadingView, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        loadingView = new LoadingUI();
                        this.stage.addChild(loadingView);
                        return [4 /*yield*/, RES.loadConfig("resource/default.res.json", "resource/")];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.loadTheme()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, RES.loadGroup("preload", 0, loadingView)];
                    case 3:
                        _a.sent();
                        this.stage.removeChild(loadingView);
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _a.sent();
                        console.error(e_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Main.prototype.loadTheme = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            // load skin theme configuration file, you can manually modify the file. And replace the default skin.
            //加载皮肤主题配置文件,可以手动修改这个文件。替换默认皮肤。
            var theme = new eui.Theme("resource/default.thm.json", _this.stage);
            theme.addEventListener(eui.UIEvent.COMPLETE, function () {
                resolve();
            }, _this);
        });
    };
    /**
    * 创建游戏场景
    */
    Main.prototype.createGameScene = function () {
        var _this = this;
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
        var angle = 45;
        var timer = new egret.Timer(this.timeSpan);
        timer.addEventListener(egret.TimerEvent.TIMER, function () {
            //创建圆
            var posX = Math.random() * 700;
            var posY = -50;
            var circle = _this.rigidBody.createCircle(_this.circleR, posX, posY);
            _this.addChild(circle[0]);
            circle[1].velocity = _this.flyJet(angle, 2);
            _this.actived_fishes.push(circle[1]);
            _this.world.addBody(circle[1]);
        }, this);
        timer.start();
        var mtimer = new egret.Timer((Math.random() * 5 + 8) * 1000);
        mtimer.addEventListener(egret.TimerEvent.TIMER, function () {
            //创建引力球
            var posX = Math.random() * 700;
            var posY = -Math.random() * 50;
            var circle = _this.rigidBody.createMagnet(_this.circleR, posX, posY);
            _this.addChild(circle[0]);
            circle[1].velocity = _this.flyJet(angle, 5);
            circle[1].type = p2.Body.KINEMATIC;
            _this.actived_magnet.push(circle[1]);
            _this.world.addBody(circle[1]);
            _this.world.bodies.forEach(function (body) {
                var displayobject = body.displays[0];
                if (displayobject.name == "fish") {
                    var posY_1 = _this.stageH - body.position[1] * _this.factor;
                    var x = 0;
                    var y = posY_1 / 2;
                    var _posx = body.position[0] + displayobject.width / 2;
                    var _posy = body.position[0] + displayobject.height / 2;
                    console.log(posY_1 + " [" + x + "," + y + "]");
                    body.applyForce([x, y], body.position);
                }
            });
        }, this);
        mtimer.start();
        this.stage.addEventListener(egret.TouchEvent.TOUCH_END, function (e) {
            var posX = Math.random() * 700;
            var posY = -Math.random() * 50;
            var circle = _this.rigidBody.createCircle(_this.circleR, posX, posY);
            _this.addChild(circle[0]);
            _this.actived_magnet.push(circle[1]);
            _this.world.addBody(circle[1]);
        }, this);
        var _timer = new egret.Timer(10);
        _timer.addEventListener(egret.TimerEvent.TIMER, function () {
            var bubbles = _this.positive_bubbles.pop();
            if (bubbles) {
                bubbles.forEach(function (bubble) {
                    var circle = self.rigidBody.createBubble(bubble[0], bubble[1][0], bubble[1][1], 0x33ff66);
                    self.addChildAt(circle[0], 1);
                    circle[1].gravityScale = 0;
                    circle[1].velocity = bubble[2];
                    self.bubbles.push(circle[1]);
                    self.world.addBody(circle[1]);
                });
            }
            _this.bubbles.forEach(function (bubble) {
                bubble.applyForce([0, _this.gravity * bubble.getArea()], bubble.position);
            });
        }, this);
        _timer.start();
        var _update = new egret.Timer(50);
        _update.addEventListener(egret.TimerEvent.TIMER, function () {
            _this.keypress_span_l_u = _this.keypress_span_l_u - 50 / 1000;
            _this.keypress_span_l_m = _this.keypress_span_l_m - 50 / 1000;
            _this.keypress_span_l_d = _this.keypress_span_l_d - 50 / 1000;
            _this.keypress_span_r_u = _this.keypress_span_r_u - 50 / 1000;
            _this.keypress_span_r_m = _this.keypress_span_r_m - 50 / 1000;
            _this.keypress_span_r_d = _this.keypress_span_r_d - 50 / 1000;
        }, this);
        _update.start();
        var self = this;
        var press_span = 0.5;
        var bvel = -5;
        document.addEventListener("keydown", function onkeydown(event) {
            var key = event.key;
            var point;
            var arr = [];
            var velocity;
            var _r = Math.random() * 30 + 40;
            var nuton = 3 * self.gravity;
            if (key == "a") {
                if (self.keypress_span_l_u > 0)
                    return;
                self.keypress_span_l_u = press_span;
                // 左上
                point = [30, 800];
                velocity = [10, 0];
            }
            else if (key == "q") {
                if (self.keypress_span_l_m > 0)
                    return;
                self.keypress_span_l_m = press_span;
                // 左中
                point = [30, 400];
                velocity = [10, 0];
            }
            else if (key == "z") {
                if (self.keypress_span_l_d > 0)
                    return;
                self.keypress_span_l_d = press_span;
                // 左下
                velocity = [0, 0];
                point = [140, 1200];
                arr.push([_r, [140, 1300], self.flyJet(angle, bvel)]);
                arr.push([_r, [140, 1400], self.flyJet(angle, bvel)]);
            }
            else if (key == "k") {
                if (self.keypress_span_r_u > 0)
                    return;
                self.keypress_span_r_u = press_span;
                // 右上
                velocity = [-10, 0];
                point = [self.stageW - 30, 800];
            }
            else if (key == "o") {
                if (self.keypress_span_r_m > 0)
                    return;
                self.keypress_span_r_m = press_span;
                // 右中
                point = [self.stageW - 30, 400];
                velocity = [-10, 0];
            }
            else if (key == "m") {
                if (self.keypress_span_r_d > 0)
                    return;
                self.keypress_span_r_d = press_span;
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
            var _this = this;
            //p2.js的世界时间流逝
            this.world.step(dt / 1000);
            //看不到的p2物体在下落，egret的外观图片也要时刻更新位置
            this.world.bodies.forEach(function (body) {
                body = body;
                var displayobject = body.displays[0];
                var flexX = 0;
                var flexY = 0;
                if (displayobject) {
                    if (displayobject.name != "") {
                        // flexX = displayobject.width / 2;
                        //     flexY = displayobject.height / 2;
                    }
                    displayobject.x = body.position[0] * _this.factor - flexX;
                    displayobject.y = _this.stageH - body.position[1] * _this.factor + flexY;
                    // console.log(body.angle);
                    var angle_1 = _this.normalizeAngle(body.angle);
                    if (displayobject.name == "fish") {
                        // displayobject.anchorOffsetX = displayobject.width / 2;
                        // displayobject.anchorOffsetY = displayobject.height / 2;
                        displayobject.rotation = angle_1 / Math.PI * 180;
                        // displayobject.anchorOffsetX = 0;
                        // displayobject.anchorOffsetY = 0;
                    }
                    if (displayobject.y > _this.stageH + 250) {
                        if (displayobject.name == "fish") {
                            if (displayobject.x < 350)
                                _this.score_left--;
                            else
                                _this.score_right--;
                        }
                        _this.displayScore();
                        _this.removeChild(displayobject);
                        _this.world.removeBody(body);
                    }
                    else if (displayobject.y < -100) {
                        _this.world.removeBody(body);
                        _this.removeChild(displayobject);
                    }
                }
                _this.actived_magnet.forEach(function (magnet) {
                    if (magnet.displays[0].y < _this.stageH + 50) {
                        _this.actived_fishes.forEach(function (fish) {
                            var gravitation = _this.calGravitation(magnet.position, fish.position);
                            fish.applyForce(gravitation, fish.position);
                        });
                    }
                });
                _this.removeDisposedAsset(_this.actived_magnet);
                _this.removeDisposedAsset(_this.actived_fishes);
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
    Main.prototype.removeDisposedAsset = function (arr) {
        var _temp = [];
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].world == null)
                _temp.push(i);
        }
        _temp.forEach(function (element) {
            arr.splice(element, 1);
        });
    };
    Main.prototype.flyJet = function (angle, velocity) {
        return [Math.cos(Math.random() * angle - angle) * velocity, Math.sin(Math.random() * angle - angle) * velocity];
    };
    Main.prototype.calGravitation = function (p1, p2) {
        var ab = Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
        var sinE = Math.abs(p1[1] - p2[1]);
        var cosE = Math.abs(p1[0] - p2[0]);
        var F = 2 / Math.pow(ab, 2);
        return [F * cosE, F * sinE];
    };
    Main.prototype.normalizeAngle = function (angle) {
        angle = angle % (2 * Math.PI);
        if (angle < 0) {
            angle += (2 * Math.PI);
        }
        return angle;
    };
    Main.prototype.dispalyCannon = function () {
        var sp_l1 = Resources.Instance().Cannon();
        sp_l1.rotation = -180;
        sp_l1.y = 800;
        var sp_l2 = Resources.Instance().Cannon();
        sp_l1.rotation = -180;
        sp_l2.y = 400;
        var sp_r1 = Resources.Instance().Cannon();
        sp_r1.y = 800;
        sp_r1.x = this.stageW;
        var sp_r2 = Resources.Instance().Cannon();
        sp_r2.y = 400;
        sp_r2.x = this.stageW;
        this.addChild(sp_l1);
        this.addChild(sp_l2);
        this.addChild(sp_r1);
        this.addChild(sp_r2);
    };
    Main.prototype.displayBg = function () {
        var w = egret.MainContext.instance.stage.stageWidth;
        var h = egret.MainContext.instance.stage.stageHeight;
        var img = new egret.Bitmap();
        img.texture = RES.getRes('background_png');
        img.width = w;
        img.height = h;
        this.addChild(img);
        var t_l = new egret.Bitmap();
        t_l.texture = RES.getRes('t_left_png');
        t_l.width = 285;
        t_l.height = 333;
        t_l.x = 121;
        t_l.y = 950;
        this.addChildAt(t_l, 1);
        var t_r = new egret.Bitmap();
        t_r.texture = RES.getRes('t_right_png');
        t_r.width = 285;
        t_r.height = 333;
        t_r.x = 584;
        t_r.y = 950;
        this.addChildAt(t_r, 1);
    };
    Main.prototype.displayScore = function () {
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
    };
    Main.prototype.generateBubbles = function () {
        for (var i = 0; i < 500; i++) {
            var circle = this.rigidBody.createCircle(1, 320, Math.random() * 1000);
            this.addChild(circle[0]);
            circle[1].gravityScale = 0.01;
            circle[1].mass = 1;
            this.bubbles.push(circle[1]);
            // circle[1].type = p2.Body.SLEEPING;
            this.world.addBody(circle[1]);
        }
    };
    Main.prototype.groundAndwall = function () {
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
    };
    Main.prototype.init = function () {
        //create world
        this.world = new p2.World({
            gravity: [0, -this.gravity]
        }); //p2.js坐标原点左下角，向上向右（重力为负）
        this.world.sleepMode = p2.World.BODY_SLEEPING;
        PhyUtils.Instance().factor = this.factor;
        PhyUtils.Instance().stageH = egret.MainContext.instance.stage.stageHeight;
        this.rigidBody.factor = this.factor;
        this.rigidBody.world = this.world;
        this.bubbles = new Array();
        this.removeChildren();
    };
    Main.prototype.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    return Main;
}(eui.UILayer));
__reflect(Main.prototype, "Main");
//# sourceMappingURL=Main.js.map