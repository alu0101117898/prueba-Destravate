import { Coordinate } from './Coordinate.js'
import { Activity } from './Activity.js'
import { UniqueList } from './UniqueList.js'

/**
 * Interface representing a track of the app.
 */
export interface TrackInterface<T = number> {
  name: string
  start: Coordinate
  end: Coordinate
  distance: number
  slope: number
  users: Array<T>
  activity: Activity
  score: number
}

/**
 * Track class.
 * A track is a route that a user can do. It is defined by:
 *  - An unique id.
 *  - A name.
 *  - A start and end point, with a distance and a slope.
 *  - A list of users that have done the track.
 *  - An activity to do in the track.
 *  - A score.
 */
export class Track<T = number> implements TrackInterface<T> {
  /**
   * Unique id of the track.
   * @type {number}
   * @readonly
   */
  public readonly id: number

  /**
   * Name of the track.
   * @type {string}
   */
  public name: string

  /**
   * Start point of the track.
   * @type {Coordinate}
   */
  public start: Coordinate

  /**
   * End point of the track.
   * @type {Coordinate}
   */
  public end: Coordinate

  /**
   * Distance of the track.
   * @type {number}
   */
  public distance: number

  /**
   * Average slope of the track.
   * @type {number}
   */
  public slope: number

  /**
   * List of users that have done the track.
   * @type {UniqueList<T>}
   */
  public users: UniqueList<T> = new UniqueList<T>()

  /**
   * Activity to do in the track.
   * @type {Activity}
   */
  public activity: Activity

  /**
   * Score result of the users reviews.
   * @type {number}
   */
  public score = 0

  /**
   * Initializes a track.
   * @param id Id of the track.
   * @param name Name of the track.
   * @param start Start point of the track.
   * @param end End point of the track.
   * @param distance Distance of the track.
   * @param slope Average slope of the track.
   * @param activity Activity to do in the track.
   */
  public constructor(
    id: number,
    name: string,
    start: Coordinate,
    end: Coordinate,
    distance: number,
    slope: number,
    activity: Activity
  ) {
    this.id = id
    this.name = name
    this.start = start
    this.end = end
    this.distance = distance
    this.slope = slope
    this.activity = activity
  }
}
