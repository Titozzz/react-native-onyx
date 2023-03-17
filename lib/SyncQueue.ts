/**
 * Synchronous queue that can be used to ensure promise based tasks are run in sequence.
 * Pass to the constructor a function that returns a promise to run the task then add data.
 *
 * @example
 *
 *     const queue = new SyncQueue(({key, val}) => {
 *         return someAsyncProcess(key, val);
 *     });
 *
 *     queue.push({key: 1, val: '1'});
 *     queue.push({key: 2, val: '2'});
 */
export default class SyncQueue<T> {
    /**
     * @param {Function} run - must return a promise
     */

    queue: {data: T, resolve: (value: unknown) => void, reject: () => void}[];

    isProcessing: boolean;

    run: (data: T) => Promise<unknown>;

    constructor(run: (args: T) => Promise<unknown>) {
        this.queue = [];
        this.isProcessing = false;
        this.run = run;
    }

    /**
     * Stop the queue from being processed and clear out any existing tasks
     */
    abort() {
        this.queue = [];
        this.isProcessing = false;
    }

    process() {
        if (this.isProcessing) {
            return;
        }

        const nextTask = this.queue.shift();
        if (!nextTask) {
            return;
        }

        this.isProcessing = true;

        const {data, resolve, reject} = nextTask;
        this.run(data)
            .then(resolve)
            .catch(reject)
            .finally(() => {
                this.isProcessing = false;
                this.process();
            });
    }

    /**
     * @param {*} data
     * @returns {Promise}
     */
    push(data: T) {
        return new Promise((resolve, reject) => {
            this.queue.push({resolve, reject, data});
            this.process();
        });
    }
}
