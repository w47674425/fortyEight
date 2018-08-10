class Common {
	/**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    public static createBitmapByName(name: string): egret.Bitmap {
        let result = new egret.Bitmap();
        let texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

    public static checkCatch(a1: Entity, a2: egret.Sprite): number {
        //console.log("a1.x=" + a1.x + " a2.x=" + a2.x)
        var a1right = a1.x+a1.getEntityWidth() ;
        var a1bottom = a1.y + a1.getEntityHeight();
        var a2right = a2.x + a2.width;
        var a2bottom = a2.y + a2.height;
        var ylimt = a2.y < a1bottom && a2bottom >= a1bottom;
        var jumpmanmidX = a1.x + a1.getEntityWidth() / 2;
        if (jumpmanmidX > a2.x && jumpmanmidX < a2right && ylimt) {
            if(a1.x < a2.x )
                return 1;
            if(a1right > a2right)
                return 1;
            if(a1.x > a2.x && a1right < a2right)
                return 2 ;
        }
        return 0;
    }

    private static token: number = 0;
    public static get Token(): number {
        return this.token++;
    }

    public static LoadMovieClip(_jsonname: string, _mcName: string, _loadMc, _x: number, _y: number) {
        let data = RES.getRes(_jsonname + "_json");
        let txtr = RES.getRes(_jsonname + "_png");
        var mcFactory: egret.MovieClipDataFactory = new egret.MovieClipDataFactory(data, txtr);
        var _mc: egret.MovieClip = new egret.MovieClip(mcFactory.generateMovieClipData(_mcName));
        _mc.x = _x;
        _mc.y = _y
        //_loadMc.addChild(_mc)
        //_mc.gotoAndPlay(_movieName, timers);
        //_mc.addEventListener(egret.Event.COMPLETE, (e: egret.Event) => {
        //监听播放完毕直接移除掉
        //_loadMc.removeChild(_mc)
        //}, this);
        return _mc;
    }

}