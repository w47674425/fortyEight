module Game {
	export class GameLayer {
		public constructor() {
		}

		private static ins: GameLayer;
        public static get Ins(): GameLayer {
            if (this.ins == null) this.ins = new GameLayer();
            return this.ins;
        }

		public Stage: egret.DisplayObjectContainer;
		public OnLoad(parent: egret.DisplayObjectContainer): void {
            this.Stage = parent;
            this.init();
        }

		 private init(): void {
		 }
	}
}