module Game {

    export interface IUpdate {
        onUpdate(time:number): void;
        setPause(b:boolean): void;
    }


}  