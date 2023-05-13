/**
 * Coordinate interface.
 * It represents a point in a track, map, challenge... Is defined by a latitude and a longitude.
 * @example
 * ```typescript
 * const coord: Coordinate = {
 *  lat: 40.4167,
 *  lng: -3.70325
 * }
 */
export type Coordinate = {
  /**
   * Latitude of the coordinate.
   * @type {number}
   */
  lat: number

  /**
   * Longitude of the coordinate.
   * @type {number}
   */
  lng: number
}
