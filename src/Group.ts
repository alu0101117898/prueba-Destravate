import { Stats } from './Stats.js'
import { UniqueList } from './UniqueList.js'
import { ExtendedEntry } from './Entry.js'

/**
 * Interface representing a group of users of the app.
 */
export interface GroupInterface<T = number> {
  name: string
  users: Array<T>
  stats: Stats
  ranking: Array<T>
  tracks: Array<T>
  records: Array<ExtendedEntry<T>>
}

/**
 * Class representing a group of users of the app.
 */
export class Group<T = number> implements GroupInterface<T> {
  /**
   * Unique id of the group.
   * @type {number}
   */
  public readonly id: number

  /**
   * Name of the group.
   * @type {string}
   */
  public name: string

  /**
   * List of users of the group.
   * @type {UniqueList<T>}
   */
  public users: UniqueList<T> = new UniqueList<T>()

  /**
   * Stats of the group.
   * @type {Stats}
   */
  public stats: Stats = new Stats()

  /**
   * List of favorite tracks of the group.
   * @type {UniqueList<T>}
   */
  public tracks: UniqueList<T> = new UniqueList<T>()

  /**
   * List of records of the group.
   * @type {UniqueList<ExtendedEntry<T>>}
   */
  public records: UniqueList<ExtendedEntry<T>> = new UniqueList<
    ExtendedEntry<T>
  >()

  /**
   * Initializes a new instance of the Group class.
   * @param id Id of the group.
   * @param name Name of the group.
   */
  public constructor(id: number, name: string, ...users: T[]) {
    this.id = id
    this.name = name
    for (const member of users) this.users.add(member)
    this.stats.values = {
      weekly: { km: 0, slope: 0 },
      monthly: { km: 0, slope: 0 },
      yearly: { km: 0, slope: 0 },
    }
  }

  /**
   * Gets the ranking of the group based on the records.
   * @returns {UniqueList<T>} Ranking of the group.
   */
  public get ranking(): UniqueList<T> {
    const ranking = new UniqueList<T>()
    const distances: { [id: string]: number } = {}
    for (const record of this.records) {
      for (const user of record.users) {
        if (distances[String(user)]) distances[String(user)] += record.km
        else distances[String(user)] = record.km
      }
    }
    const sorted = Object.keys(distances).sort(
      (a, b) => distances[b] - distances[a]
    )
    for (const id of sorted)
      if (this.convertToT(id) && this.users.has(this.convertToT(id) as T))
        ranking.add(this.convertToT(id) as T)
    return ranking
  }

  /**
   * Method to convert a value to the type T.
   * @param value Value to be converted.
   * @returns The value converted to T.
   */
  /* c8 ignore start */
  private convertToT(value: any): T | null {
    if (
      typeof value === 'string' &&
      typeof Number(value) === 'number' &&
      !isNaN(Number(value))
    )
      return Number(value) as T
    return null
  }
  /* c8 ignore stop */
}
