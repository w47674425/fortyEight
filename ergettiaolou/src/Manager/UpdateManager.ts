module Game {
    export class UpdateManager extends egret.EventDispatcher
    {
        public constructor() {
            super();
            Game.GameLayer.Ins.Stage.addEventListener(egret.Event.ENTER_FRAME, this.update, this);
        }

        private static instance: UpdateManager;

        public static get Instance(): UpdateManager {
            if (this.instance == null) this.instance = new UpdateManager();
            return this.instance;
        }

        public IsStop: boolean = false;
        public setStop(b:boolean){
            this.IsStop = b
            for (var key in this.dicData)
            {
                 (<Game.IObject>this.dicData[key]).setPause(b)
            }
        }

        private dicData = new Object();
        public GetModuleList(): Object {
            return this.dicData;
        }

        public RegisterModule(object:Game.IObject): void {
            this.dicData[object.ID.toString()] = object;    
        }

        public UnRegisterModule(object: Game.IObject): void {  
            delete this.dicData[object.ID.toString()];
        }

        private update(e:egret.Event): void
        {
            if (this.IsStop) {
                return;
            }
            
            for (var key in this.dicData)
            {
                //根据需求，具体模块自己去算吧，这里传回当前时间
                /*var nowTime: number = Math.abs(performance.now());
                var passTime: number = nowTime - this.lastTime;
                this.lastTime = nowTime;*/
                (<Game.IObject>this.dicData[key]).onUpdate(1000/30);
            }
        }

    }
} 