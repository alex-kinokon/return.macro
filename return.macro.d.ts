/**
 * See Kotlin’s `?: return`.
 *
 * Inserts a return statement afterwards if (any of) such value is null or undefined
 *
 * @example
 * const value = getValue() ?? _return()
 * const [left, right] = getValue() ?? _return()
 * const { node } = getValue() ?? _return()
 */
declare function _return(returnee?: any): any
export default _return
