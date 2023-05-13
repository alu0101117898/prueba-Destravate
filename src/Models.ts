import { model, Schema } from 'mongoose'

import { Activity } from './Activity.js'

import { TrackInterface } from './Track.js'
import { UserInterface } from './User.js'
import { GroupInterface } from './Group.js'
import { ChallengeInterface } from './Challenge.js'

/**
 * Schema representing a track of the app.
 */
export const TrackSchema = new Schema<TrackInterface<string>>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  start: {
    type: Object,
    required: true,
  },
  end: {
    type: Object,
    required: true,
  },
  distance: {
    type: Number,
    required: true,
  },
  slope: {
    type: Number,
    required: true,
  },
  users: {
    type: Schema.Types.Mixed,
    required: false,
    default: [],
  },
  activity: {
    type: String,
    required: true,
    enum: Object.values(Activity),
  },
  score: {
    type: Number,
    required: false,
  },
})

/**
 * Model for the Track schema.
 */
export const TrackModel = model<TrackInterface<string>>('Track', TrackSchema)

/**
 * Schema representing a user of the app.
 */
export const UserSchema = new Schema<UserInterface<string>>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  activity: {
    type: String,
    required: true,
    enum: Object.values(Activity),
  },
  users: {
    type: Schema.Types.Mixed,
    required: false,
    default: [],
  },
  groups: {
    type: Schema.Types.Mixed,
    required: false,
    default: [],
  },
  stats: {
    type: Array,
    required: false,
  },
  tracks: {
    type: Schema.Types.Mixed,
    required: false,
    default: [],
  },
  challenges: {
    type: Schema.Types.Mixed,
    required: false,
    default: [],
  },
  records: {
    type: Schema.Types.Mixed,
    required: false,
  },
})

/**
 * Model for the User schema.
 */
export const UserModel = model<UserInterface<string>>('User', UserSchema)

/**
 * Schema representing a group of the app.
 */
export const GroupSchema = new Schema<GroupInterface<string>>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  users: {
    type: Schema.Types.Mixed,
    required: false,
    default: [],
  },
  stats: {
    type: Array,
    required: false,
  },
  ranking: {
    type: Schema.Types.Mixed,
    required: false,
    default: [],
  },
  tracks: {
    type: Schema.Types.Mixed,
    required: false,
    default: [],
  },
  records: {
    type: Schema.Types.Mixed,
    required: false,
  },
})

/**
 * Model for the Group schema.
 */
export const GroupModel = model<GroupInterface<string>>('Group', GroupSchema)

/**
 * Schema representing a challenge of the app.
 */
export const ChallengeSchema = new Schema<ChallengeInterface<string>>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  activity: {
    type: String,
    required: true,
    enum: Object.values(Activity),
  },
  tracks: {
    type: Schema.Types.Mixed,
    required: false,
    default: [],
  },
  users: {
    type: Schema.Types.Mixed,
    required: false,
    default: [],
  },
})

/**
 * Model for the Challenge schema.
 */
export const ChallengeModel = model<ChallengeInterface<string>>(
  'Challenge',
  ChallengeSchema
)
