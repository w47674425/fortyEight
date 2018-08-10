/**
 * Created by Five on 2018/06/03
 */
class Resources{
    
    public static instance:Resources = null;

    public static Instance() {
        if (Resources.instance == null) {
            Resources.instance = new Resources();
        }
        return Resources.instance;
    }    

    public Sprite(name: string): egret.Bitmap {
        let result = new egret.Bitmap();
        let texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

    public constructor() {   
    }  
}