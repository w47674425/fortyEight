class RigidBody {

    public factor: number = 0;

    public world: p2.World;

    public supportertrect(_width: number, _height: number, _rotation: number, _x: number, _y: number) {
        var supporterShape: p2.Shape = new p2.Box({
            width: _width,
            height: _height
        });
        var supporterBody: p2.Body = new p2.Body({
            mass: 0,
            position: [_x / this.factor, _y / this.factor],
            angle: Math.PI * ((_rotation) / 180),
            angularVelocity: 0
        });
        supporterBody.type = p2.Body.STATIC;
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

    public createBitmapByName(name: string): egret.Bitmap {
        var result: egret.Bitmap = new egret.Bitmap();
        var texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

    public createCircle(_r: number, _x: number, _y: number): any {
        var circle: egret.Shape = new egret.Shape();
        circle.graphics.beginFill(0xffffff);
        circle.graphics.drawCircle(0, 0, _r);
        circle.graphics.endFill();
        circle.x = _x;
        circle.y = _y;

        var cpxInP2: number = PhyUtils.Instance().extendX(_x);
        var cpyInP2: number = PhyUtils.Instance().extendY(_y);
        var crInP2: number = _r / this.factor;

        var circleBodyInP2: p2.Body = new p2.Body({
            mass: 1,
            position: [cpxInP2, cpyInP2]
        });
        var circleShapeInP2: p2.Circle = new p2.Circle({
            radius: crInP2
        });
        circleBodyInP2.addShape(circleShapeInP2);
        circleBodyInP2.displays = [circle];

        return  [circle, circleBodyInP2];
    }
}