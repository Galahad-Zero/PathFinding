export default class PriorityQueue<T> {
    private items: { item: T; priority: number }[] = [];

    constructor(private _smallPriority: boolean = false) {}

    get(): T | undefined {
        return this.items.shift()?.item;
    }

    put(item: T, priority: number): void {
        // 如果元素已存在，则更新优先级
        // const itemIndex = this.items.findIndex((cur) => cur.item === item);
        const newItem = { item, priority };
        // if (itemIndex !== -1) {
        //     newItem = this.items.splice(itemIndex, 1)[0];
        // }

        // 使用插入排序，根据优先级插入到正确位置
        const insertIndex = this.items.findIndex((cur) => {
            return this._smallPriority
                ? priority < cur.priority
                : priority > cur.priority;
        });

        if (insertIndex === -1) {
            this.items.push(newItem);
        } else {
            this.items.splice(insertIndex, 0, newItem);
        }
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }

    size(): number {
        return this.items.length;
    }
}
