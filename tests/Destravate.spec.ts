import 'mocha'
import { expect } from 'chai'
import request from 'supertest'
import { connect, disconnect } from 'mongoose'

import { UniqueList } from '../src/UniqueList.js'
import { Activity } from '../src/Activity.js'
import { Coordinate } from '../src/Coordinate.js'
import { Track } from '../src/Track.js'
import { User } from '../src/User.js'
import { Group } from '../src/Group.js'
import { Challenge } from '../src/Challenge.js'
import { Server } from '../src/Server.js'
import {
  TrackModel,
  UserModel,
  GroupModel,
  ChallengeModel,
} from '../src/Models.js'

let user_id = ''
let track_id = ''
let group_id = ''
let challenge_id = ''

let server: Server
before(async function () {
  server = new Server()
  await server.start(process.env.PORT || 3000)
  await connect(process.env.MONGODB_URL!)
  await TrackModel.deleteMany()
  await UserModel.deleteMany()
  await GroupModel.deleteMany()
  await ChallengeModel.deleteMany()
})

describe('Destravate app tests', () => {
  describe('Track class tests', () => {
    const coord1: Coordinate = {
      lat: 40.4167,
      lng: -3.70325,
    }
    const coord2: Coordinate = {
      lat: 52.520008,
      lng: 13.404954,
    }
    const track1: Track = new Track(
      0,
      'Route to El Dorado',
      coord1,
      coord2,
      100,
      0.5,
      Activity.running
    )
    it('Track Objects should have an id', () => {
      expect(track1.id).to.be.a('number')
      expect(track1.id).to.equal(0)
    })
    it('Track Objects should have a name', () => {
      expect(track1.name).to.be.a('string')
      expect(track1.name).to.equal('Route to El Dorado')
    })
    it('Track Objects should have a start and end points, and both should be Coordinates', () => {
      expect(track1.start).to.be.a('object')
      expect(track1.start).to.have.property('lat')
      expect(track1.start).to.have.property('lng')
      expect(track1.start.lat).to.be.a('number')
      expect(track1.start.lng).to.be.a('number')
      expect(track1.start.lat).to.equal(40.4167)
      expect(track1.start.lng).to.equal(-3.70325)
      expect(track1.end).to.be.a('object')
      expect(track1.end).to.have.property('lat')
      expect(track1.end).to.have.property('lng')
      expect(track1.end.lat).to.be.a('number')
      expect(track1.end.lng).to.be.a('number')
      expect(track1.end.lat).to.equal(52.520008)
      expect(track1.end.lng).to.equal(13.404954)
    })
    it('Track Objects should have a distance', () => {
      expect(track1.distance).to.be.a('number')
      expect(track1.distance).to.equal(100)
    })
    it('Track Objects should have a slope', () => {
      expect(track1.slope).to.be.a('number')
      expect(track1.slope).to.equal(0.5)
    })
    it('Track Objects should have a list of users that have done the track', () => {
      expect(track1.users).to.be.a('array')
      expect(track1.users).to.have.lengthOf(0)
    })
    it('Track Objects should have an activity', () => {
      expect(Object.values(Activity)).to.include(track1.activity)
    })
    it('Track Objects should have a score', () => {
      expect(track1.score).to.be.a('number')
      expect(track1.score).to.equal(0)
    })
  })

  describe('User class tests', () => {
    const user = new User(0, 'Iluzio', Activity.running)
    it('User Objects should have an id', () => {
      expect(user.id).to.be.a('number')
      expect(user.id).to.equal(0)
    })
    it('User Objects should have a name', () => {
      expect(user.name).to.be.a('string')
      expect(user.name).to.equal('Iluzio')
    })
    it('User Objects should have an sport activity', () => {
      expect(Object.values(Activity)).to.include(user.activity)
    })

    it('User Objects should have a list of users', () => {
      expect(user.users).to.be.a('array')
      expect(user.users).to.have.lengthOf(0)
    })
    it('User Objects should be able to add users', () => {
      user.users.add(1)
      expect(user.users).to.have.lengthOf(1)
      expect(user.users).to.include(1)
    })
    it('User Objects should be able to remove users', () => {
      user.users.remove(1)
      expect(user.users).to.have.lengthOf(0)
      expect(user.users).to.not.include(1)
    })
    it('User Objects should have a list of groups in which the user is', () => {
      expect(user.groups).to.be.a('array')
      expect(user.groups).to.have.lengthOf(0)
    })
    it('User Objects should be able to add groups', () => {
      user.groups.add(1)
      expect(user.groups).to.have.lengthOf(1)
      expect(user.groups).to.include(1)
    })
    it('User Objects should be able to remove groups', () => {
      user.groups.remove(1)
      expect(user.groups).to.have.lengthOf(0)
      expect(user.groups).to.not.include(1)
    })
    it('User Objects should have stats', () => {
      expect(Object.keys(user.stats.values)).includes('weekly')
      expect(Object.keys(user.stats.values)).includes('monthly')
      expect(Object.keys(user.stats.values)).includes('yearly')
    })
    it('User Objects should be able to reset stats', () => {
      user.stats.reset()
      expect(user.stats.values['weekly']).to.be.deep.equal({ km: 0, slope: 0 })
      expect(user.stats.values['monthly']).to.be.deep.equal({ km: 0, slope: 0 })
      expect(user.stats.values['yearly']).to.be.deep.equal({ km: 0, slope: 0 })
    })
    it('User Objects should have a list of favorite tracks', () => {
      expect(user.tracks).to.be.a('array')
      expect(user.tracks).to.have.lengthOf(0)
    })
    it('User Objects should be able to add favorite tracks', () => {
      user.tracks.add(1)
      expect(user.tracks).to.have.lengthOf(1)
      expect(user.tracks).to.include(1)
    })
    it('User Objects should be able to remove favorite tracks', () => {
      user.tracks.remove(1)
      expect(user.tracks).to.have.lengthOf(0)
      expect(user.tracks).to.not.include(1)
    })
    it('User Objects should have a list of active challenges', () => {
      expect(user.challenges).to.be.a('array')
      expect(user.challenges).to.have.lengthOf(0)
    })
    it('User Objects should be able to add active challenges', () => {
      user.challenges.add(1)
      expect(user.challenges).to.have.lengthOf(1)
      expect(user.challenges).to.include(1)
    })
    it('User Objects should be able to remove active challenges', () => {
      user.challenges.remove(1)
      expect(user.challenges).to.have.lengthOf(0)
      expect(user.challenges).to.not.include(1)
    })
    it('User Objects should have a record of the tracks done', () => {
      expect(user.records).to.be.a('array')
      expect(user.records).to.have.lengthOf(0)
    })
    it('User Objects should be able to add records', () => {
      user.records.add({ date: '2019-01-01', tracks: new UniqueList(1, 2, 3) })
      expect(user.records).to.have.lengthOf(1)
      expect(user.records).to.be.deep.equal([
        { date: '2019-01-01', tracks: new UniqueList(1, 2, 3) },
      ])
    })
    it('User Objects should know if the friend/group/favorite/challenge/record is in the list when adding', () => {
      user.users.add(1)
      expect(user.users.add(1)).to.be.false
      user.groups.add(1)
      expect(user.groups.add(1)).to.be.false
      user.tracks.add(1)
      expect(user.tracks.add(1)).to.be.false
      user.challenges.add(1)
      expect(user.challenges.add(1)).to.be.false
      user.records.add({ date: '2019-01-01', tracks: new UniqueList(1, 2, 3) })
      expect(
        user.records.add({
          date: '2019-01-01',
          tracks: new UniqueList(1, 2, 3),
        })
      ).to.be.false
    })
    it('User Objects should know if the friend/group/favorite/challenge/record is not in the list when removing', () => {
      expect(user.users.remove(2)).to.be.false
      expect(user.groups.remove(2)).to.be.false
      expect(user.tracks.remove(2)).to.be.false
      expect(user.challenges.remove(2)).to.be.false
      expect(
        user.records.remove({
          date: '2019-01-01',
          tracks: new UniqueList(1, 2),
        })
      ).to.be.false
    })
  })

  describe('Group class tests', () => {
    const group = new Group(0, 'Canary Team', 3, 4)
    it('Group Objects should have an id', () => {
      expect(group.id).to.be.a('number')
      expect(group.id).to.equal(0)
    })
    it('Group Objects should have a name', () => {
      expect(group.name).to.be.a('string')
      expect(group.name).to.equal('Canary Team')
    })
    it('Group Objects should have a list of users', () => {
      expect(group.users).to.be.a('array')
      expect(group.users).to.have.lengthOf(2)
    })
    it('Group Objects should be able to add users', () => {
      group.users.add(1)
      expect(group.users).to.have.lengthOf(3)
      expect(group.users).to.include(1)
    })
    it('Group Objects should be able to remove users', () => {
      group.users.remove(1)
      expect(group.users).to.have.lengthOf(2)
      expect(group.users).to.not.include(1)
    })
    it('Group Objects should have stats', () => {
      expect(Object.keys(group.stats.values)).includes('weekly')
      expect(Object.keys(group.stats.values)).includes('monthly')
      expect(Object.keys(group.stats.values)).includes('yearly')
    })
    it('Group Objects should be able to reset stats', () => {
      group.stats.reset()
      expect(group.stats.values['weekly']).to.be.deep.equal({ km: 0, slope: 0 })
      expect(group.stats.values['monthly']).to.be.deep.equal({
        km: 0,
        slope: 0,
      })
      expect(group.stats.values['yearly']).to.be.deep.equal({ km: 0, slope: 0 })
    })
    it('Group Objects should have a list of favorite tracks', () => {
      expect(group.tracks).to.be.a('array')
      expect(group.tracks).to.have.lengthOf(0)
    })
    it('Group Objects should be able to add favorite tracks', () => {
      group.tracks.add(1)
      expect(group.tracks).to.have.lengthOf(1)
      expect(group.tracks).to.include(1)
    })
    it('Group Objects should be able to remove favorite tracks', () => {
      group.tracks.remove(1)
      expect(group.tracks).to.have.lengthOf(0)
      expect(group.tracks).to.not.include(1)
    })
    it('Group Objects should have a record of the tracks done', () => {
      expect(group.records).to.be.a('array')
      expect(group.records).to.have.lengthOf(0)
    })
    it('Group Objects should be able to add records', () => {
      group.records.add({
        date: '2019-01-01',
        tracks: new UniqueList(1, 2, 3),
        users: new UniqueList(1, 2, 3),
        km: 10,
      })
      expect(group.records).to.have.lengthOf(1)
      expect(group.records).to.be.deep.equal([
        {
          date: '2019-01-01',
          tracks: new UniqueList(1, 2, 3),
          users: new UniqueList(1, 2, 3),
          km: 10,
        },
      ])
    })
    it('Group Objects should know if the user/favorite/record is in the list when adding', () => {
      group.users.add(1)
      expect(group.users.add(1)).to.be.false
      group.tracks.add(1)
      expect(group.tracks.add(1)).to.be.false
      group.records.add({
        date: '2019-01-01',
        tracks: new UniqueList(1, 2, 3),
        users: new UniqueList(1, 2, 3),
        km: 10,
      })
      expect(
        group.records.add({
          date: '2019-01-01',
          tracks: new UniqueList(1, 2, 3),
          users: new UniqueList(1, 2, 3),
          km: 10,
        })
      ).to.be.false
    })
    it('Group Objects should know if the user/favorite/record is not in the list when removing', () => {
      expect(group.users.remove(2)).to.be.false
      expect(group.tracks.remove(2)).to.be.false
      expect(
        group.records.remove({
          date: '2019-01-01',
          tracks: new UniqueList(1, 2),
          users: new UniqueList(1, 2),
          km: 10,
        })
      ).to.be.false
    })
    it('Group Objects should have a ranking', () => {
      group.records.add({
        date: '2023-01-01',
        tracks: new UniqueList(1, 3),
        users: new UniqueList(3),
        km: 250,
      })
      expect(group.ranking).to.be.a('array')
      expect(group.ranking).to.have.lengthOf(2)
    })
  })

  describe('Challenge class tests', () => {
    const challenge = new Challenge(
      0,
      'The World Warrior',
      Activity.cycling,
      0,
      1
    )
    it('Challenge Objects should have an id', () => {
      expect(challenge.id).to.be.a('number')
      expect(challenge.id).to.equal(0)
    })
    it('Challenge Objects should have a name', () => {
      expect(challenge.name).to.be.a('string')
      expect(challenge.name).to.equal('The World Warrior')
    })
    it('Challenge Objects should have an activity', () => {
      expect(Object.values(Activity)).to.include(challenge.activity)
    })
    it('Challenge Objects should have a list of tracks that are part of the challenge', () => {
      expect(challenge.tracks).to.be.a('array')
      expect(challenge.tracks).to.have.lengthOf(2)
      expect(challenge.tracks).to.be.deep.equal([0, 1])
    })
    it('Challenge Objects should be able to add tracks', () => {
      challenge.tracks.add(2)
      expect(challenge.tracks).to.have.lengthOf(3)
    })
    it('Challenge Objects should be able to remove tracks', () => {
      challenge.tracks.remove(2)
      expect(challenge.tracks).to.have.lengthOf(2)
    })
    it('Challenge Objects should have a list of users that are part of the challenge', () => {
      expect(challenge.users).to.be.a('array')
      expect(challenge.users).to.have.lengthOf(0)
    })
    it('Challenge Objects should be able to add users', () => {
      challenge.users.add(1)
      expect(challenge.users).to.have.lengthOf(1)
      expect(challenge.users).to.include(1)
    })
    it('Challenge Objects should be able to remove users', () => {
      challenge.users.remove(1)
      expect(challenge.users).to.have.lengthOf(0)
      expect(challenge.users).to.not.include(1)
    })
    it('Challenge Objects should know if the user/track is in the list when adding', () => {
      challenge.users.add(1)
      expect(challenge.users.add(1)).to.be.false
      challenge.tracks.add(1)
      expect(challenge.tracks.add(1)).to.be.false
    })
    it('Challenge Objects should know if the user/track is not in the list when removing', () => {
      expect(challenge.users.remove(2)).to.be.false
      expect(challenge.tracks.remove(2)).to.be.false
    })
  })
  describe('Server class tests', () => {
    it('Servers should be able to make POST requests to the API', async () => {
      await request(server.app)
        .post('/users')
        .send({
          name: 'Test User',
          activity: 'running',
        })
        .expect(201)

      await UserModel.findOne({ name: 'Test User' }).then((user) => {
        if (user) user_id = user._id.toString()
      })
      await request(server.app)
        .post('/tracks')
        .send({
          name: 'Test Track',
          start: {
            lat: 0,
            lng: 0,
          },
          end: {
            lat: 1,
            lng: 1,
          },
          distance: 100,
          slope: 3.1,
          users: [user_id],
          activity: 'running',
        })
        .expect(201)
      await TrackModel.findOne({ name: 'Test Track' }).then((track) => {
        if (track) track_id = track._id.toString()
      })
      await request(server.app)
        .post('/groups')
        .send({
          name: 'Test Group',
          users: [user_id],
          tracks: [track_id],
        })
        .expect(201)
      await GroupModel.findOne({ name: 'Test Group' }).then((group) => {
        if (group) group_id = group._id.toString()
      })
      await request(server.app)
        .post('/challenges')
        .send({
          name: 'Test Challenge',
          activity: 'running',
          tracks: [track_id],
          users: [user_id],
        })
        .expect(201)
      await ChallengeModel.findOne({ name: 'Test Challenge' }).then(
        (challenge) => {
          if (challenge) challenge_id = challenge._id.toString()
        }
      )
    })
    it('Servers should be able to make GET requests to the API', async () => {
      await request(server.app).get('/users').expect(200)
      await request(server.app).get('/tracks').expect(200)
      await request(server.app).get('/groups').expect(200)
      await request(server.app).get('/challenges').expect(200)
      await request(server.app)
        .get('/users/' + user_id)
        .expect(200)
      await request(server.app)
        .get('/tracks/' + track_id)
        .expect(200)
      await request(server.app)
        .get('/groups/' + group_id)
        .expect(200)
      await request(server.app)
        .get('/challenges/' + challenge_id)
        .expect(200)
    })
    it('Servers should be able to make PATCH requests to the API', async () => {
      await request(server.app)
        .patch('/users/' + user_id)
        .send({
          name: 'Test User Updated',
          activity: 'running',
        })
        .expect(200)
      await request(server.app)
        .patch('/tracks/' + track_id)
        .send({
          name: 'Test Track Updated',
          start: {
            lat: 0,
            lng: 1,
          },
          end: {
            lat: 1,
            lng: 0,
          },
          distance: 100,
          slope: 3.1,
          users: [user_id],
          activity: 'running',
        })
      await request(server.app)
        .patch('/groups/' + group_id)
        .send({
          name: 'Test Group Updated',
          users: [],
          tracks: [track_id],
        })
        .expect(200)
      await request(server.app)
        .patch('/challenges/' + challenge_id)
        .send({
          name: 'Test Challenge Updated',
          activity: 'running',
          tracks: [track_id],
          users: [],
        })
    })
    it('Servers should be able to make DELETE requests to the API', async () => {
      await request(server.app)
        .delete('/users/' + user_id)
        .expect(200)
      await request(server.app)
        .delete('/tracks/' + track_id)
        .expect(200)
      await request(server.app)
        .delete('/groups/' + group_id)
        .expect(200)
      await request(server.app)
        .delete('/challenges/' + challenge_id)
        .expect(200)
    })
  })
})

after(async function () {
  await server.stop()
  await disconnect()
})
