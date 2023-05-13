/**
 * Definition of the Stats type used in the application.
 * A stat is a pair of km and slope, it can be daily, weekly, monthly...
 */
export type Stat = {
  /**
   * Kilometers of the stat.
   * @type {number}
   */
  km: number

  /**
   * Slope of the stat.
   * @type {number}
   */
  slope: number
}

/**
 * Definition of the Stats class used in the application.
 * This class represents the stats of a user or a group.
 */
export class Stats {
  /**
   * List of stats.
   * @type {{ [key: string]: Stat }}
   */
  public values: { [key: string]: Stat }

  /**
   * Initializes a new instance of the Stats class.
   */
  public constructor() {
    this.values = {}
  }

  /**
   * Resets the stats.
   * @returns {void}
   */
  public reset(): void {
    for (const key in this.values) {
      this.values[key].km = 0
      this.values[key].slope = 0
    }
  }
}
