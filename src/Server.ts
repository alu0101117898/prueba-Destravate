import express from 'express'
import { Server as HttpServer } from 'http'
import { connect, disconnect } from 'mongoose'

import { Group } from './Group.js'

import { UniqueList } from './UniqueList.js'
import { ExtendedEntry } from './Entry.js'
import { TrackModel, UserModel, GroupModel, ChallengeModel } from './Models.js'

const routes = [
  '/tracks',
  '/tracks/:id',
  '/users',
  '/users/:id',
  '/groups',
  '/groups/:id',
  '/challenges',
  '/challenges/:id',
]

export class Server {
  /**
   * Instance of the http server.
   * @private
   * @type { HttpServer }
   */
  private server: HttpServer = new HttpServer()
  /**
   * Instance of the express app.
   * @public
   * @type {express.Application}
   */
  public app: express.Application = express()

  /* c8 ignore start */
  /**
   * Initializes the server of the app.
   */
  public constructor() {
    this.app.use(express.json())
    this.defineGet()
    this.definePost()
    this.defineDelete()
    this.definePatch()
    this.app.all('*', (_, res) => {
      res.status(501).send()
    })
  }

  /**
   * Defines the get requests of the server.
   */
  private defineGet() {
    for (const route of routes) {
      this.app.get(route, (req, res) => {
        this.get(req, res)
          .then(() => {})
          .catch((err) => {
            console.log('Error in get request: ' + err)
          })
      })
    }
  }

  /**
   * Defines the post requests of the server.
   */
  private definePost() {
    for (const route of routes) {
      this.app.post(route, (req, res) => {
        this.post(req, res)
          .then(() => {})
          .catch((err) => {
            console.log('Error in post request: ' + err)
          })
      })
    }
  }

  /**
   * Defines the delete requests of the server.
   */
  private defineDelete() {
    for (const route of routes) {
      this.app.delete(route, (req, res) => {
        this.delete(req, res)
          .then(() => {})
          .catch((err) => {
            console.log('Error in delete request: ' + err)
          })
      })
    }
  }

  /**
   * Defines the patch requests of the server.
   */
  private definePatch() {
    for (const route of routes) {
      this.app.patch(route, (req, res) => {
        this.patch(req, res)
          .then(() => {})
          .catch((err) => {
            console.log('Error in patch request: ' + err)
          })
      })
    }
  }

  /**
   * Starts listening on the specified port
   * @param port Port to listen on
   */
  public start(port: number | string): void {
    this.server = this.app.listen(port, () => {
      console.log(`Server listening on port ${port}`)
    })
  }

  /**
   * Shuts down the server
   */
  public stop(): void {
    disconnect()
    this.server.close()
  }
  /* c8 ignore stop */

  /**
   * Method to handle get requests.
   * @param req Request
   * @param res Response
   */
  private get = async (req: express.Request, res: express.Response) => {
    connect(process.env.MONGODB_URL!)
      .then(() => {
        let model
        let url = req.url
        if (req.url.includes('?'))
          url = req.url.substring(0, req.url.indexOf('?'))
        if (/\/[a-z]+\/[a-z0-9]+$/.test(url))
          url = url.substring(0, url.lastIndexOf('/'))
        switch (url) {
          case '/tracks':
            model = TrackModel
            break
          case '/users':
            model = UserModel
            break
          case '/groups':
            model = GroupModel
            break
          case '/challenges':
            model = ChallengeModel
            break
          default:
            break
        }
        if (model && req.params.id)
          model
            .findById(req.params.id)
            .then((result) => {
              this.searchResult(result, res)
            })
            .catch((err) => {
              res.status(500).json({ message: err })
            })
        else if (model && req.query.name)
          model
            .find({ name: req.query.name.toString() })
            .then((result) => {
              this.searchResult(result, res)
            })
            .catch((err) => {
              res.status(500).json({ message: err })
            })
        else if (model)
          model
            .find()
            .then((result) => {
              this.searchResult(result, res)
            })
            .catch((err) => {
              res.status(500).json({ message: err })
            })
        else res.status(400).json({ message: 'Bad parameters' })
      })
      .catch((err) => {
        console.log('Error connecting to database: ' + err)
      })
  }

  /**
   * Method to handle post requests.
   * @param req Request
   * @param res Response
   */
  private post = async (req: express.Request, res: express.Response) => {
    connect(process.env.MONGODB_URL!)
      .then(() => {
        let document
        let url = req.url
        let body = req.body
        if (url.includes('?'))
          res.status(400).json({ message: 'Bad parameters' })
        if (/\/[a-z]+\/[a-z0-9]+$/.test(url))
          url = url.substring(0, url.lastIndexOf('/'))
        try {
          switch (url) {
            case '/tracks':
              document = new TrackModel(body)
              this.createReferencesToTrack(document)
                .then(() => {})
                .catch((err) => {
                  res.status(500).json({ message: err })
                })
              break
            case '/users':
              document = new UserModel(body)
              this.createReferencesToUser(document)
                .then(() => {})
                .catch((err) => {
                  res.status(500).json({ message: err })
                })
              break
            case '/groups':
              body = this.updateRanking(body)
              document = new GroupModel(body)
              this.createReferencesToGroup(document)
                .then(() => {})
                .catch((err) => {
                  res.status(500).json({ message: err })
                })
              break
            case '/challenges':
              document = new ChallengeModel(body)
              this.createReferencesToChallenge(document)
                .then(() => {})
                .catch((err) => {
                  res.status(500).json({ message: err })
                })
              break
            default:
              break
          }
        } catch (err) {
          res.status(400).json({ message: 'Bad parameters', error: err })
          return
        }
        if (document) {
          document
            .save()
            .then((result) => {
              res.status(201).json({ message: 'Created', result: result })
            })
            .catch((err) => {
              res.status(500).json({ message: err })
            })
        } else res.status(400).json({ message: 'Bad parameters' })
      })
      .catch((err) => {
        console.log('Error connecting to database: ' + err)
      })
  }

  /**
   * Links the track to the other documents.
   * @param document Track document
   */
  private async createReferencesToTrack(document: any) {
    await UserModel.find({ _id: { $in: document.users } }).then((users) => {
      if (document.users && users.length !== document.users.length)
        throw new Error('User not found')
    })
    await UserModel.updateMany(
      { _id: { $in: document.users } },
      { $push: { tracks: document._id } },
      { multi: true, runValidators: true }
    )
  }

  /**
   * Links the user to the other documents.
   * @param document User document
   */
  private async createReferencesToUser(document: any) {
    await TrackModel.find({ _id: { $in: document.tracks } }).then((tracks) => {
      if (document.tracks && tracks.length !== document.tracks.length)
        throw new Error('Track not found')
    })
    await TrackModel.updateMany(
      { _id: { $in: document.tracks } },
      { $push: { users: document._id } },
      { multi: true, runValidators: true }
    )
    await ChallengeModel.find({ _id: { $in: document.challenges } }).then(
      (challenges) => {
        if (
          document.challenges &&
          challenges.length !== document.challenges.length
        )
          throw new Error('Challenge not found')
      }
    )
    await ChallengeModel.updateMany(
      { _id: { $in: document.challenges } },
      { $push: { users: document._id } },
      { multi: true, runValidators: true }
    )
    await GroupModel.find({ _id: { $in: document.groups } }).then((groups) => {
      if (document.groups && groups.length !== document.groups.length)
        throw new Error('Group not found')
    })
    await GroupModel.updateMany(
      { _id: { $in: document.groups } },
      { $push: { users: document._id } },
      { multi: true, runValidators: true }
    )
  }

  /**
   * Links the group to the other documents.
   * @param document Group document
   */
  private async createReferencesToGroup(document: any) {
    await UserModel.find({ _id: { $in: document.users } }).then((users) => {
      if (document.users && users.length !== document.users.length)
        throw new Error('User not found')
    })
    await UserModel.updateMany(
      { _id: { $in: document.users } },
      { $push: { groups: document._id } },
      { multi: true, runValidators: true }
    )
  }

  /**
   * Links the challenge to the other documents.
   * @param document Challenge document
   */
  private async createReferencesToChallenge(document: any) {
    await UserModel.find({ _id: { $in: document.users } }).then((users) => {
      if (document.users && users.length !== document.users.length)
        throw new Error('User not found')
    })
    await UserModel.updateMany(
      { _id: { $in: document.users } },
      { $push: { challenges: document._id } },
      { multi: true, runValidators: true }
    )
  }

  /**
   * Method to handle delete requests.
   * @param req Request
   * @param res Response
   */
  private delete = async (req: express.Request, res: express.Response) => {
    connect(process.env.MONGODB_URL!)
      .then(() => {
        let model
        let url = req.url
        if (req.url.includes('?'))
          url = req.url.substring(0, req.url.indexOf('?'))
        if (/\/[a-z]+\/[a-z0-9]+$/.test(url))
          url = url.substring(0, url.lastIndexOf('/'))
        switch (url) {
          case '/tracks':
            model = TrackModel
            break
          case '/users':
            model = UserModel
            break
          case '/groups':
            model = GroupModel
            break
          case '/challenges':
            model = ChallengeModel
            break
          default:
            break
        }
        if (model && req.params.id) {
          model
            .findByIdAndDelete(req.params.id)
            .then((result) => {
              this.deleteReferencesFromUser(req.params.id)
                .then(() => {})
                .catch((err) => {
                  res.status(500).json({ message: err })
                })
              res.status(200).json({ message: 'Deleted', result: result })
            })
            .catch((err) => {
              res.status(500).json({ message: err })
            })
        } else if (model && req.query.name) {
          model
            .findOne({ name: req.query.name })
            .then((result) => {
              if (result) {
                if (model === UserModel)
                  this.deleteReferencesFromUser(result.id)
                    .then(() => {})
                    .catch((err) => {
                      res.status(500).json({ message: err })
                    })
              }
            })
            .catch((err) => {
              res.status(500).json({ message: err })
            })
          model
            .deleteOne({ name: req.query.name })
            .then((result) => {
              if (result.deletedCount === 0)
                res.status(404).json({ message: 'Not found' })
              else res.status(200).json({ message: 'Deleted', result: result })
            })
            .catch((err) => {
              res.status(500).json({ message: err })
            })
        } else {
          res.status(400).json({ message: 'Bad parameters' })
        }
      })
      .catch((err) => {
        console.log('Error connecting to database: ' + err)
      })
  }

  /**
   * Deletes all references to a user in the database before deleting the user.
   * @param id ID of the user to delete
   */
  private async deleteReferencesFromUser(id: string) {
    await TrackModel.find({ users: { $in: [id] } }).then((tracks) => {
      tracks.forEach((track) => {
        track.users = new UniqueList<string>(
          ...track.users.filter((user) => user !== id)
        )
        track.save()
      })
    })
    await UserModel.find({ users: { $in: [id] } }).then((users) => {
      users.forEach((user) => {
        user.users = new UniqueList<string>(
          ...user.users.filter((friend) => friend !== id)
        )
        user.save()
      })
    })
    await GroupModel.find({ users: { $in: [id] } }).then((groups) => {
      groups.forEach((group) => {
        group.users = new UniqueList<string>(
          ...group.users.filter((member) => member !== id)
        )
        group.ranking.splice(group.ranking.indexOf(id), 1)
        group.records.forEach((record) => {
          record.users.splice(record.users.indexOf(id), 1)
        })
      })
    })
    await ChallengeModel.find({ users: { $in: [id] } }).then((challenges) => {
      challenges.forEach((challenge) => {
        challenge.users = new UniqueList<string>(
          ...challenge.users.filter((user) => user !== id)
        )
      })
    })
  }

  /**
   * Method to handle patch requests.
   * @param req Request
   * @param res Response
   */
  private patch = async (req: express.Request, res: express.Response) => {
    connect(process.env.MONGODB_URL!)
      .then(() => {
        let model
        let url = req.url
        let body = req.body
        if (req.url.includes('?'))
          url = req.url.substring(0, req.url.indexOf('?'))
        if (/\/[a-z]+\/[a-z0-9]+$/.test(url))
          url = url.substring(0, url.lastIndexOf('/'))
        switch (url) {
          case '/tracks':
            model = TrackModel
            break
          case '/users':
            model = UserModel
            break
          case '/groups':
            model = GroupModel
            body = this.updateRanking(body)
            break
          case '/challenges':
            model = ChallengeModel
            break
          default:
            break
        }
        if (model && req.params.id)
          model
            .findByIdAndUpdate(req.params.id, body, {
              new: true,
              runValidators: true,
            })
            .then((result) => {
              this.searchResult(result, res)
            })
            .catch((err) => {
              res.status(500).json({ message: err })
            })
        else if (model && req.query.name)
          model
            .findOneAndUpdate({ name: req.query.name.toString() }, body, {
              new: true,
              runValidators: true,
            })
            .then((result) => {
              this.searchResult(result, res)
            })
            .catch((err) => {
              res.status(500).json({ message: err })
            })
        else res.status(400).json({ message: 'Bad parameters' })
      })
      .catch((err) => {
        console.log('Error connecting to database: ' + err)
      })
  }

  /**
   * Returns a status code depending on the result.
   * @param result Result of the search
   * @param res Response
   */
  private searchResult(result: any, res: express.Response): void {
    if (!result) res.status(404).json({ message: 'Not found' })
    else res.status(200).json({ message: 'Found', result: result })
  }

  /**
   * Updates the document with the new records.
   * @param document Document to update
   * @param body Body of the request
   * @returns Updated document
   */
  private updateRanking(body: any): any {
    const { id, name, users } = body
    const group = new Group(id, name, ...users)
    if (!body.records) return body
    for (const record of body.records)
      record.users = new UniqueList(...record.users)
    group.records = new UniqueList<ExtendedEntry>(...body.records)
    const ranking = group.ranking.values
    body.ranking = ranking
    return body
  }
}
