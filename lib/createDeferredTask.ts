/**
 * Create a deferred task that can be resolved when we call `resolve()`
 * The returned promise will complete when we call `resolve`
 * Useful when we want to wait for a tasks that is resolved from an external action
 *
 * @template T
 * @returns {{ resolve: function(*), promise: Promise<T|void> }}
 */
export default function createDeferredTask() {
    let resRef: null | ((v: unknown) => void) = null;

    const resolve = () => {
        if (!resRef) {
            return;
        }
        resRef(null);
    };

    const promise = new Promise((res) => {
        resRef = res;
    });

    return {promise, resolve} as const;
}
