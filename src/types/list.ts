export class List<Type> {

    #arr: Array<Type>;

    #count: number;

    constructor() {
        this.#arr = new Array<Type>();
        this.#count = 0;
    }

    public Count(): number {
        return this.#count;
    }

    public Clear(): void {
        this.#count = 0;
    }

    public At(index: number): Type {
        return this.#arr[index];
    }

    public Push(value: Type): void {
        if (this.#arr.length === this.#count) {
            this.#arr.push(value);
        } else {
            this.#arr[this.#count] = value;
        }
        this.#count++;
    }

    public ToArray(): Array<Type> {
        let arr = new Array<Type>(this.Count());
        for(let i = 0; i < this.#count; i ++) {
            arr[i] = this.#arr[i]
        }
        return arr;
    }

}