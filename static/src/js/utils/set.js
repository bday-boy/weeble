/**
 * If all elements of set A exist in set B, we return true. Returns false
 * otherwise.
 * @param {Set} A - The set to check for subsetness (?)
 * @param {Set} B - The set of which A might be a subset
 * @returns {Boolean} True if set A is a subset of set B, false if not
 */
const isSubset = (A, B) => (![...A].some((x) => !B.has(x)));

/**
 * Returns a new set that contains all of the elements of A that do NOT exist
 * in set B.
 * @param {Set} A - The set to take elements out of
 * @param {Set} B - The set whose elements we are removing from A
 * @returns {Set} The difference between the two sets
 */
const setDif = (A, B) => new Set([...A].filter((x) => !B.has(x)));

/**
 * Returns a new set that contains only the elements that exist in both set A
 * and set B.
 * @param {Set} A
 * @param {Set} B
 * @returns {Set} The intersection of sets A and B
 */
const setIntersection = (A, B) => new Set([...A].filter((x) => B.has(x)));

export { isSubset, setDif, setIntersection };