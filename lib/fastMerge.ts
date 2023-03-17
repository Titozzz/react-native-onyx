import deepmerge from 'deepmerge';

/**
 * @param {mixed} val
 * @returns {boolean}
*/
function isMergeableObject(val: unknown) {
    const nonNullObject = val != null ? typeof val === 'object' : false;
    return (nonNullObject
    && Object.prototype.toString.call(val) !== '[object RegExp]'
    && Object.prototype.toString.call(val) !== '[object Date]');
}

function arrayMerge(_destinationArray: unknown[], sourceArray: unknown[]) {
    return sourceArray;
}

/**
 * @param {Object} target
 * @param {Object} source
 * @returns {Object}
*/
function fastMerge(target: Parameters<(typeof deepmerge)>[0], source: Parameters<(typeof deepmerge)>[1]) {
    return deepmerge(target, source, {isMergeableObject, arrayMerge});
}

export default fastMerge;
