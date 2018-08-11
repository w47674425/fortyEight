class RigidBody {

    public factor: number = 0;

    public world: p2.World;

    public supportertrect(_width: number, _height: number, _rotation: number, _x: number, _y: number) {
        var supporterShape: p2.Shape = new p2.Box({ width: _width, height: _height });
        var supporterBody: p2.Body = new p2.Body({
            mass: 0, position: [_x / this.factor, _y / this.factor],
            angle: Math.PI * ((_rotation) / 180),
            angularVelocity: 0
        });
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

    Fish: Array<string> = ["fish_y_png", "fish_g_png", "fish_p_png", "fish_o_png"]

    public createCircle(_r: number, _x: number, _y: number, _c?: number): any {
        let _sprite = new egret.Sprite();
        var circle: egret.Bitmap = new egret.Bitmap();
        let fish_index = Math.round(Math.random() * 3);
        circle.texture = RES.getRes(this.Fish[fish_index]);
        circle.width = _r;
        circle.height = _r;
        // circle.x = _x;
        // circle.y = _y;
        // circle.name = "fish";

        let bound = new egret.Shape();
        bound.graphics.clear();

        bound.graphics.beginFill(0xff0000, 1);
        bound.graphics.drawRect(0, 0, circle.width, circle.height);
        bound.graphics.endFill();
        _sprite.name = "fish";

        // _sprite.addChild(bound);
        _sprite.addChild(circle);
        _sprite.anchorOffsetX = _sprite.width / 2;
        _sprite.anchorOffsetY = _sprite.height / 2;
        return this.createP2Body(_x, _y, _r, _sprite);
    }

    public createMagnet(_r: number, _x: number, _y: number): any {
        var circle: egret.Bitmap = new egret.Bitmap();
        let fish_index = Math.round(Math.random() * 2);
        circle.texture = RES.getRes("niddle_png");
        circle.width = _r;
        circle.height = _r;
        circle.x = _x;
        circle.y = _y;
        circle.name = "magnet";

        return this.createP2Body(_x, _y, _r, circle);
    }

    public createP2Body(_x, _y, _r, _circle): any {
        var cpxInP2: number = PhyUtils.Instance().extendX(_x);
        var cpyInP2: number = PhyUtils.Instance().extendY(_y);
        var crInP2: number = _r / this.factor / 2;

        var circleBodyInP2: p2.Body = new p2.Body({
            mass: 1,
            position: [cpxInP2, cpyInP2]
        });
        var circleShapeInP2: p2.Circle = new p2.Circle({
            radius: crInP2
        });
        circleBodyInP2.addShape(circleShapeInP2);
        circleBodyInP2.displays = [_circle];
        return [_circle, circleBodyInP2];
    }

    public createBubble(_r: number, _x: number, _y: number, _c?: number): any {
        var circle: egret.Bitmap = new egret.Bitmap();
        circle.texture = RES.getRes("bubble_png");
        circle.width = _r;
        circle.height = _r;
        circle.x = _x;
        circle.y = _y;
        circle.name = "bubble";

        return this.createP2Body(_x, _y, _r, circle);
    }
}