export function TimeExecution(name: string, callback: Function) {
    const start = name + "_Start";
    const end = name + "_End";

    performance.mark(start);
    callback();
    performance.mark(end);
    performance.measure(name, start, end);
}