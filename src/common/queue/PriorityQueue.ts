export default class PriorityQueue<T> {
    private items: { item: T; priority: number }[] = [];

    constructor(private _smallPriority: boolean = false) {}

    get(): T | undefined {
        return this.items.shift()?.item;
    }

    put(item: T, priority: number): void {
        this.items.push({ item, priority });
        // 使用插入排序，根据优先级插入到正确位置
        const newItem = { item, priority };
        let insertIndex = this.items.length - 1;

        // 找到正确的插入位置
        for (let i = this.items.length - 2; i >= 0; i--) {
            const shouldInsertBefore = this._smallPriority
                ? priority < this.items[i].priority
                : priority > this.items[i].priority;

            if (shouldInsertBefore) {
                insertIndex = i;
            } else {
                break;
            }
        }

        // 将新元素插入到正确位置
        this.items.splice(insertIndex, 0, newItem);
        this.items.pop(); // 移除最后添加的元素，因为我们已经在正确位置插入了
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }

    size(): number {
        return this.items.length;
    }
}
