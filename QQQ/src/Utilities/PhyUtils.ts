/**
 * Created by Five on 2018/08/10
 */
class PhyUtils{
    
    public static instance:PhyUtils = null;

    public static Instance() {
        if (PhyUtils.instance == null) {
            PhyUtils.instance = new PhyUtils();
        }
        return PhyUtils.instance;
    }    

    public factor : number;
    public stageH : number;

    public extendX(x : number) : number {
        return x / this.factor;
    }  

    public extendY(y : number) : number {
        return (this.stageH - y) / this.factor;
    }  
    
    

    public constructor() {   
    }  
}