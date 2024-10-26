import { Vector2 } from "./vector2";



export class Pool<Type> {

    #arr: Array<Type>;

    #count: number;

    #builder: () => Type;

    #reset: (v: Type) => void;

    constructor(builder: () => Type, reset: (v: Type) => void) {
        this.#arr = new Array<Type>();
        this.#count = 0;
        this.#builder = builder;
        this.#reset = reset;
    }

    public runIf(condition: boolean, fn: () => void) {
        if(condition) {
            this.run(fn);
        }
    }

    public run(fn: () => void) {
        const start = this.#count;
        fn();
        this.#count = start;
        // console.log(this.#arr.length);
    }

    get(): Type {
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
