import { UniqueList } from './UniqueList'

/**
 * A class that stores an entry of a record in the app.
 * An entry is defined by:
 *  - A date.
 *  - A list of tracks done in that date.
 */
export type Entry<T = number> = {
  /**
   * Date of the entry.
   * @type {string}
   */
  date: string
  /**
   * List of tracks done in that date.
   * @type {UniqueList<T>}
   */
  tracks: UniqueList<T>
}

/**
 * A class that stores an extended entry of a record in the app.
 */
export type ExtendedEntry<T = number> = Entry<T> & {
  users: UniqueList<T>
  km: number
}
