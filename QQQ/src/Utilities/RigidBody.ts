class RigidBody {

    public factor: number = 0;

    public world: p2.World;

    public supportertrect(_width: number, _height: number, _rotation: number, _x: number, _y: number) {
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
        return display
    }

    public creatrect(_width: number, _height: number, _rotation: number, _x: number, _y: number, self: egret.DisplayObjectContainer) {
        var display: egret.DisplayObject = this.createBitmapByName('rect_png')
        display.width = _width;
        display.height = _height;
        display.x = _x;
        display.y = _y;
        display.rotation = -_rotation;
        display.anchorOffsetX = display.width / 2;
        display.anchorOffsetY = display.height / 2;
        display.touchEnabled = true;
        display.addEventListener(egret.TouchEvent.TOUCH_BEGIN, startMove, self);
        display.addEventListener(egret.TouchEvent.TOUCH_END, stopMove, self);
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
            self.addChild(draggedObject);
            //手指在屏幕上移动，会触发 onMove 方法
            self.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, onMove, self);
        }
        function stopMove(e: egret.TouchEvent) {
            //            console.log(22);
            //手指离开屏幕，移除手指移动的监听
            self.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, onMove, self);
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

        return display;
    }


    public createGround(world: p2.World, container: egret.DisplayObjectContainer
        , id: number, vx: number, w: number, h: number, resid: string, x0: number, y0: number): p2.Body {
        var p2body: p2.Body = new p2.Body(
            {
                mass: 1
                , fixedRotation: true
                , position: [x0 + w / 2, y0 + h / 2]
                , velocity: vx
            }
        );
        p2body.type = (vx == 0 ? p2.Body.STATIC : p2.Body.KINEMATIC)

        p2body.id = id;
        console.log("位置：", p2body.position);
        world.addBody(p2body);
        var p2rect: p2.Shape = new p2.Shape();
        p2body.addShape(p2rect);
        var bitmap: egret.Bitmap = this.createBitmapByName(resid);
        bitmap.width = w;
        bitmap.height = h;
        bitmap.anchorOffsetX = bitmap.anchorOffsetY = .5;
        p2body.displays = [bitmap];
        container.addChild(bitmap);
        return p2body;
    }


    public createBitmapByName(name: string): egret.Bitmap {
        var result: egret.Bitmap = new egret.Bitmap();
        var texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }
}