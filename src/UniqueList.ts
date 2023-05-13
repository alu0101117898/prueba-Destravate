/**
 * A class that stores a list of unique values.
 */
export class UniqueList<T = number> extends Array<T> {
  /**
   * Initializes the list with the given values.
   * @param values Values to be added to the list.
   */
  public constructor(...values: T[]) {
    super()
    for (const value of values) this.add(value)
  }

  /**
   * Method that checks if a value is in the list.
   * @param value Value to be checked.
   * @returns True if the value is in the list, false otherwise.
   */
  public has(value: T): boolean {
    for (const v of this)
      if (JSON.stringify(v) === JSON.stringify(value)) return true
    return false
  }

  /**
   * Adds a value to the list.
   * @param value Value to be added.
   * @returns True if the value was added, false otherwise.
   */
  public add(value: T): boolean {
    if (this.has(value)) return false
    this.push(value)
    return true
  }

  /**
   * Removes a value from the list.
   * @param value Value to be removed.
   * @returns True if the value was removed, false otherwise.
   */
  public remove(value: T): boolean {
    if (!this.has(value)) return false
    this.splice(this.indexOf(value), 1)
    return true
  }
}
