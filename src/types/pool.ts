import { Vector2 } from "./vector2";



export class Pool<Type> {

    #arr: Array<Type>;

    #count: number;

    #builder: () => Type;

    #reset: (v: Type) => void;

    #runningDepth: number;

    constructor(builder: () => Type, reset: (v: Type) => void) {
        this.#arr = new Array<Type>();
        this.#count = 0;
        this.#builder = builder;
        this.#reset = reset;
        this.#runningDepth = 0;
    }

    public runIf(condition: boolean, fn: () => void) {
        if (condition) {
            this.run(fn);
        }
    }

    #running(): boolean {
        return this.#runningDepth > 0;
    }

    public run(fn: () => void) {
        const start = this.#count;
        this.#runningDepth += 1;
        fn();
        this.#runningDepth -= 1;
        this.#count = start;
        // console.log(this.#arr.length);
    }

    get(): Type {
        if(!this.#running()) {
            throw new Error("can't use pool outside of running context");
        }

        let value: Type;
        if (this.#arr.length === this.#count) {
            value = this.#builder();
            this.#arr.push(this.#builder());
        } else {
            value = this.#arr[this.#count];
            this.#reset(value);
        }
        this.#count++;
        return value;
    }

}

export const VectorPool = new Pool<Vector2>(
    () => ({ x: 0, y: 0 }),
    (v) => { v.x = 0; v.y = 0; }
)
