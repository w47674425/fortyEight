/**
 * 游戏界面
 * 
 * Five
 */
class GameLayer extends eui.Component {
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

	score_left_tf: eui.ProgressBar;
	score_right_tf: eui.ProgressBar;
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

	public constructor() {
		super();
		this.addEventListener(egret.Event.COMPLETE, this.onAddToStage, this);
		this.skinName = "resource/eui_skins/Gaming.exml";
	}

	private onAddToStage(): void {
		this.init();

		this.displayTower();
		this.displayScore();
		// this.dispalyCannon();

		SoundMenager.Shared().PlayBGM();

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
		let angle = -30;
		var timer: egret.Timer = new egret.Timer(this.timeSpan);
		//创建圆
		timer.addEventListener(egret.TimerEvent.TIMER, () => {
			let posX = Math.random() * 700;
			let posY = 50;

			let circle = this.rigidBody.createCircle(this.circleR, posX, posY);
			this.addChild(circle[0]);
			circle[1].velocity = this.flyJet(angle, 10);
			this.actived_fishes.push(circle[1]);
			this.world.addBody(circle[1]);
		}, this);
		timer.start();

		var mtimer: egret.Timer = new egret.Timer((Math.random() * 5 + 8) * 1000);
		//创建引力球
		mtimer.addEventListener(egret.TimerEvent.TIMER, () => {
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
					let y = posY / 1.3;
					let _posx = body.position[0] + displayobject.width / 2;
					let _posy = body.position[0] + displayobject.height / 2;
					console.log(posY + " [" + x + "," + y + "]");
					body.applyForce([x, y], body.position);
				}
			});
		}, this);
		mtimer.start();

		// 点击消息
		this.addEventListener(egret.TouchEvent.TOUCH_END, (e: egret.TouchEvent) => {
			let posX = Math.random() * 700;
			let posY = - Math.random() * 50;

			let circle = this.rigidBody.createCircle(this.circleR, posX, posY);
			this.addChild(circle[0]);
			this.actived_magnet.push(circle[1]);
			this.world.addBody(circle[1]);
		}, this);

		let _timer = new egret.Timer(10);
		// 生产玩家发起的气泡
		_timer.addEventListener(egret.TimerEvent.TIMER, () => {
			let bubbles = this.positive_bubbles.pop();
			if (bubbles) {
				bubbles.forEach(bubble => {
					let circle = self.rigidBody.createBubble(bubble[0], bubble[1][0], bubble[1][1]);
					self.addChildAt(circle[0], 10);
					circle[1].gravityScale = 0;
					circle[1].velocity = bubble[2];
					self.bubbles.push(circle[1]);
					self.world.addBody(circle[1]);
				});
			}

			this.bubbles.forEach(bubble => {
				bubble.applyForce([0, 0.05 * this.gravity * bubble.getArea()], bubble.position);
			});
		}, this);
		_timer.start();
		// 测试代码
		// let circle = this.rigidBody.createBubble(30, 750, 1200);
		// this.addChildAt(circle[0], 10);
		//  circle = this.rigidBody.createBubble(30, 200, 1200);
		// this.addChildAt(circle[0], 10);

		let _update = new egret.Timer(50);
		// 处理点击间隔
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
		let press_span = 1.2;
		let bvel = -5;
		angle = 5;
		// 键盘消息
		document.addEventListener("keydown", function onkeydown(event: KeyboardEvent) {
			let key = event.key;
			let point: number[];
			let arr: Array<any> = [];
			let velocity: number[];
			let _r: number = Math.random() * 30 + 40;
			let nuton = 3 * self.gravity;
			if (key == "a") {
				// 左上
				if (self.keypress_span_l_u > 0)
					return;
				self.keypress_span_l_u = press_span
				point = [30, 840];
				velocity = [15, 0];
				arr.push([_r, [30, 800], [velocity[0] + (Math.random() - 0.5) * 4, 0]]);
				arr.push([_r, [30, 850], [velocity[0] + (Math.random() - 0.5) * 4, 0]]);
			} else if (key == "q") {
				// 左中
				if (self.keypress_span_l_m > 0)
					return;
				self.keypress_span_l_m = press_span
				point = [30, 440];
				velocity = [15, 0];
				arr.push([_r, [30, 400], [velocity[0] + (Math.random() - 0.5) * 4, 0]]);
				arr.push([_r, [30, 450], [velocity[0] + (Math.random() - 0.5) * 4, 0]]);
			} else if (key == "z") {
				// 左下
				if (self.keypress_span_l_d > 0)
					return;
				self.keypress_span_l_d = 1.4
				velocity = [0, 0];
				point = [200, 1350];
				arr.push([_r, [200, 1200], self.flyJet(angle, bvel)]);
				arr.push([_r, [200, 1250], self.flyJet(angle, bvel)]);
				arr.push([_r, [200, 1280], self.flyJet(angle, bvel)]);
				arr.push([_r, [200, 1300], self.flyJet(angle, bvel)]);
			} else if (key == "k") {
				// 右上
				if (self.keypress_span_r_u > 0)
					return;
				self.keypress_span_r_u = press_span
				velocity = [-15, 0];
				point = [self.stageW - 30, 840];
				arr.push([_r, [self.stageW-30, 800], [velocity[0] + (Math.random() - 0.5) * 4, 0]]);
				arr.push([_r, [self.stageW-30, 850], [velocity[0] + (Math.random() - 0.5) * 4, 0]]);
			} else if (key == "o") {
				// 右中
				if (self.keypress_span_r_m > 0)
					return;
				self.keypress_span_r_m = press_span
				point = [self.stageW - 30, 440];
				velocity = [-15, 0];
				arr.push([_r, [self.stageW-30, 400], [velocity[0] + (Math.random() - 0.5) * 4, 0]]);
				arr.push([_r, [self.stageW-30, 450], [velocity[0] + (Math.random() - 0.5) * 4, 0]]);
			} else if (key == "m") {
				// 右下
				if (self.keypress_span_r_d > 0)
					return;
				self.keypress_span_r_d = 1.4
				velocity = [0, 0];
				point = [750, 1350];
				arr.push([_r, [750, 1200], self.flyJet(angle, bvel)]);
				arr.push([_r, [750, 1250], self.flyJet(angle, bvel)]);
				arr.push([_r, [750, 1280], self.flyJet(angle, bvel)]);
				arr.push([_r, [750, 1300], self.flyJet(angle, bvel)]);
			}
			else {
				return;
			}
			self.positive_bubbles.push(arr);
			SoundMenager.Shared().PlayClick();
		});

		// groundAndwall
		this.groundAndwall();
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
					// change position
					displayobject.x = body.position[0] * this.factor - flexX;
					displayobject.y = this.stageH - body.position[1] * this.factor + flexY;

					// rotate
					let angle = this.normalizeAngle(body.angle);
					if (displayobject.name == "fish") {
						displayobject.rotation = angle / Math.PI * 180;
					}

					// cal scores and remove out bound objects
					if (displayobject.y > this.stageH + 150) {
						if (displayobject.name == "fish") {
							if (displayobject.x < 350)
								this.eat_left();
							else
								this.eat_right();
						}
						this.removeChild(displayobject);
						this.world.removeBody(body);
					} else if (displayobject.y < -100) {
						this.world.removeBody(body);
						this.removeChild(displayobject);
					}
				}

				// cal magnet gravation
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
		return [Math.cos(Math.random() * angle - angle) * velocity,   -1*velocity];
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

	private displayTower() {
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
			this.score_left_tf = this.createBar(true);
			this.score_left_tf.x = 80;
			this.addChildAt(this.score_left_tf, 1);
		}
		if (!this.score_right_tf) {
			this.score_right_tf = this.createBar();
			this.score_right_tf.x = 870;
			this.addChildAt(this.score_right_tf, 1);
		}
	}

	private eat_left() {
		this.score_left_tf.value--;
		if (this.score_left_tf.value == 0) {
			if (this.parent)
				this.parent.dispatchEventWith("endGame", true, "1");
		}
	}
	private eat_right() {
		this.score_right_tf.value--;
		if (this.score_right_tf.value == 0) {
			if (this.parent)
				this.parent.dispatchEventWith("endGame", true, "0");
		}
	}

	private createBar(left?) {
		let bar: eui.ProgressBar = new eui.ProgressBar();
		if (!left)
			bar.skinName = "resource/eui_skins/ProgressBarLeftSkin.exml";
		bar.direction = eui.Direction.BTT;
		bar.y = 200;
		bar.maximum = 10;
		bar.minimum = 0;
		bar.value = 100;
		return bar;
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
	}

	public createBitmapByName(name: string): egret.Bitmap {
		var result: egret.Bitmap = new egret.Bitmap();
		var texture: egret.Texture = RES.getRes(name);
		result.texture = texture;
		return result;
	}
}