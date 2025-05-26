export default class Queue<T> {
    private items: T[] = [];

    get(): T | undefined {
        return this.items.shift();
    }

    put(item: T): void {
        this.items.push(item);
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }

    size(): number {
        return this.items.length;
    }
}
