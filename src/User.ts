import { Activity } from './Activity.js'
import { Stats } from './Stats.js'
import { UniqueList } from './UniqueList.js'
import { Entry } from './Entry.js'

/**
 * Interface representing a user of the app.
 */
export interface UserInterface<T = number> {
  name: string
  activity: Activity
  stats: Stats
  users: T[]
  groups: T[]
  tracks: T[]
  challenges: T[]
  records: Entry<T>[]
}

/**
 * Class representing a user of the app.
 */
export class User<T = number> implements UserInterface<T> {
  /**
   * Unique id of the user.
   * @type {number}
   * @readonly
   */
  public readonly id: number

  /**
   * Name (or nickname) of the user.
   * @type {string}
   */
  public name: string

  /**
   * Activity of the user.
   * @type {Activity}
   */
  public activity: Activity

  /**
   * List of users of the user.
   * @type {UniqueList<T>}
   */
  public users: UniqueList<T> = new UniqueList<T>()

  /**
   * List of groups of the user.
   * @type {UniqueList<T>}
   */
  public groups: UniqueList<T> = new UniqueList<T>()

  /**
   * Stats of the user.
   * @type {UserStats}
   */
  public stats: Stats = new Stats()

  /**
   * List of favorite tracks of the user.
   * @type {UniqueList<T>}
   */
  public tracks: UniqueList<T> = new UniqueList<T>()

  /**
   * List of active challenges of the user.
   * @type {UniqueList<T>}
   */
  public challenges: UniqueList<T> = new UniqueList<T>()

  /**
   * List of tracks done by the user grouped by date.
   * @type {UniqueList}
   * @template {Entry<T>}
   */
  public records: UniqueList<Entry<T>> = new UniqueList<Entry<T>>()

  /**
   * Initializes a new instance of the User class.
   * @param id Unique id of the user.
   * @param name Name (or nickname) of the user.
   * @param activity Activity of the user.
   */
  public constructor(id: number, name: string, activity: Activity) {
    this.id = id
    this.name = name
    this.activity = activity
    this.stats.values = {
      weekly: { km: 0, slope: 0 },
      monthly: { km: 0, slope: 0 },
      yearly: { km: 0, slope: 0 },
    }
  }
}
