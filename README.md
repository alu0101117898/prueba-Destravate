# Práctica 12 - Destravate

[![Node.js CI](https://github.com/ULL-ESIT-INF-DSI-2223/ull-esit-inf-dsi-22-23-prct12-destravate-api-groupa/actions/workflows/node.js.yml/badge.svg)](https://github.com/ULL-ESIT-INF-DSI-2223/ull-esit-inf-dsi-22-23-prct12-destravate-api-groupa/actions/workflows/node.js.yml) [![Coveralls](https://github.com/ULL-ESIT-INF-DSI-2223/ull-esit-inf-dsi-22-23-prct12-destravate-api-groupa/actions/workflows/coveralls.yml/badge.svg)](https://github.com/ULL-ESIT-INF-DSI-2223/ull-esit-inf-dsi-22-23-prct12-destravate-api-groupa/actions/workflows/coveralls.yml) [![Sonar-Cloud](https://github.com/ULL-ESIT-INF-DSI-2223/ull-esit-inf-dsi-22-23-prct12-destravate-api-groupa/actions/workflows/sonarcloud.yml/badge.svg)](https://github.com/ULL-ESIT-INF-DSI-2223/ull-esit-inf-dsi-22-23-prct12-destravate-api-groupa/actions/workflows/sonarcloud.yml) [![pages-build-deployment](https://github.com/ULL-ESIT-INF-DSI-2223/ull-esit-inf-dsi-22-23-prct12-destravate-api-groupa/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/ULL-ESIT-INF-DSI-2223/ull-esit-inf-dsi-22-23-prct12-destravate-api-groupa/actions/workflows/pages/pages-build-deployment)

## Introducción

El objetivo de esta práctica es implementar un API REST, haciendo uso de Node/Express, que permita llevar a cabo operaciones de creación, lectura, modificación y borrado [(Create, Read, Update, Delete - CRUD)](https://developer.mozilla.org/es/docs/Glossary/CRUD) de un registro de actividades deportivas.

La aplicación estará conformada por usuarios que se podrán registrar en la base de datos, grupos formados por usuarios, rutas deportivas y retos a realizar.

Todas las entradas serán guardadas en una base de datos [MongoDB](https://www.mongodb.com/), haciendo uso de Modelado de Datos con Mongoose. Por último, la API será desplegada en [Cyclic](https://www.cyclic.sh/).

## Planteamiento

Para el diseño de nuestra jerarquía de estructuras de datos empezamos definiendo una clase para cada tipo de objeto a almacenar en la base de datos, resultando en las clases:

- `User`
- `Group`
- `Track`
- `Challenge`

Realmente no era necesario realizar estas clases ya que al ser una API REST, los datos se almacenan en la base de datos y se devuelven en formato JSON (realmente sólo interesa la interfaz que conforman a cada una de ellas), pero se ha decidido realizarlas para poder realizar las operaciones de validación de datos y de comprobación de unicidad de los mismos, en vista a un posible desarrollo de una aplicación por consola que haga uso de la API.

Para funcionar, las clases necesitan de otras estructuras de apoyo, como por ejemplo la definición de las coordenadas que definen un punto de una ruta deportiva, las listas con los distintos identificadores... Al final, estas estructuras son:

- `Activity`. Define una enumeración con los distintos tipos de actividad deportiva permitidos.
- `Coordinate`. Define un tipo de objeto que representa una coordenada geográfica.
- `Entry`. Define un tipo de objeto que representa una entrada en la base de datos.
- `Stats`. Define una clase que representa las estadísticas de una ruta deportiva.
- `UniqueList`. Define una clase que representa una lista de elementos únicos.

Por último, para poder gestionar tanto la base de datos como las solicitudes realizadas a la API, se ha definido la clase `Server`, que se encarga de gestionar las peticiones HTTP y de realizar las operaciones necesarias en la base de datos. Para ello, se ha hecho uso de la librería [Express](https://expressjs.com/).

![Express](./images/express.png)

Además, este servidor creará, consultará, eliminará y modificará los datos de la base de datos haciendo uso de la librería [Mongoose](https://mongoosejs.com/) y de los modelos definidos en el fichero `Model`.

![MongoDB](./images/mongodb.png)

## Desarrollo

En el siguiente apartado profundizaremos más en los ficheros que conforman la API, explicando su funcionamiento y su estructura.

### Activity.ts

Aquí se encuentra la definición del enumerado `Activity`, que contiene los distintos tipos de actividad deportiva que los usuarios pueden realizar.

Se ha optado por escoger este tipo de estructura para poder controlar mejor los valores introducidos como actividad, evitando entradas ilógicas como por ejemplo `universidad` o `dormir`.

```TypeScript
export enum Activity {
  running = 'running',
  cycling = 'cycling',
  hiking = 'hiking',
}
```

### Coordinate.ts

Este fichero define un tipo de dato llamado `Coordinate` que representa una coordenada geográfica. El tipo de dato tiene dos propiedades: `lat` y `lng`, que representan la latitud y longitud de la coordenada, respectivamente.

Se utilizará este tipo de dato para representar los puntos de una ruta deportiva en los objetos de tipo `Track`.

```TypeScript
export type Coordinate = {
  lat: number
  lng: number
}
```

### UniqueList.ts

El siguiente fichero define la clase `UniqueList`, que se trata de una ampliación de la clase `Array` de JavaScript. Esta clase permite almacenar elementos únicos, evitando que se puedan almacenar elementos duplicados.

Esta estructura la creamos para poder garantizar que los datos almacenados en la base de datos no contengan elementos duplicados, como por ejemplo, que un usuario esté dos veces en un grupo.

```TypeScript
export class UniqueList<T = number> extends Array<T> {
  public constructor(...values: T[]) {
    super()
    for (const value of values) this.add(value)
  }

  public has(value: T): boolean {
    for (const v of this)
      if (JSON.stringify(v) === JSON.stringify(value)) return true
    return false
  }

  public add(value: T): boolean {
    if (this.has(value)) return false
    this.push(value)
    return true
  }

  public remove(value: T): boolean {
    if (!this.has(value)) return false
    this.splice(this.indexOf(value), 1)
    return true
  }
}
```

### Entry.ts

Este fichero define dos tipos de datos: `Entry` y `ExtendedEntry`. Estas estructuras se utilizan para guardar registros en la base de datos, en concreto para guardar las entradas de las rutas realizadas por usuarios y para el historial de los grupos.

Las clases se han implementado usando plantillas de TypeScript, de forma que se puedan utilizar con distintos tipos de datos. Esto es para poder utilizar distintos tipos de identificadores para los usuarios y las rutas deportivas.

El tipo `ExtendedEntry` es una extensión del tipo `Entry` que añade dos propiedades: `users` y `km`. La propiedad `users` es una lista de usuarios que han realizado la ruta deportiva y la propiedad `km` es un número que representa la distancia total de la ruta deportiva. Este tipo es el que se utilizará en los grupos

```TypeScript
import { UniqueList } from './UniqueList'

export type Entry<T = number> = {
  date: string
  tracks: UniqueList<T>
}

export type ExtendedEntry<T = number> = Entry<T> & {
  users: UniqueList<T>
  km: number
}
```

### Stats.ts

```TypeScript
export type Stat = {

  km: number

  slope: number
}

export class Stats {

  public values: { [key: string]: Stat }

  public constructor() {
    this.values = {}
  }

  public reset(): void {
    for (const key in this.values) {
      this.values[key].km = 0
      this.values[key].slope = 0
    }
  }
}
```

Este código define una interfaz `Stat` y una clase `Stats`.

La interfaz `Stat` define un objeto que tiene dos propiedades: `km` y `slope`, ambas de tipo número.

La clase `Stats` tiene una propiedad pública llamada `values` que es un objeto que tiene claves de tipo string y valores de tipo `Stat`. El constructor de la clase inicializa la propiedad `values` como un objeto vacío.

La clase `Stats` también tiene un método público llamado `reset()` que no devuelve nada (void). Este método itera sobre todas las claves del objeto `values` y establece los valores de `km` y `slope` en cero.

### Track.ts

```TypeScript
import { Coordinate } from './Coordinate.js'
import { Activity } from './Activity.js'
import { UniqueList } from './UniqueList.js'

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

export class Track<T = number> implements TrackInterface<T> {
  public readonly id: number
  public name: string
  public start: Coordinate
  public end: Coordinate
  public distance: number
  public slope: number
  public users: UniqueList<T> = new UniqueList<T>()
  public activity: Activity
  public score = 0

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
```

Este código define una interfaz `TrackInterface` y una clase `Track`.

La interfaz `TrackInterface` define un objeto que tiene varias propiedades, incluyendo `name`, `start`, `end`, `distance`, `slope`, `users`, `activity` y `score`. Algunas de estas propiedades tienen tipos genéricos, lo que significa que pueden ser de cualquier tipo.

La clase `Track` implementa la interfaz `TrackInterface` y tiene varias propiedades públicas, incluyendo `id`, `name`, `start`, `end`, `distance`, `slope`, `users`, `activity` y `score`. La propiedad `id` es de solo lectura y se establece en el constructor. Las propiedades `name`, `start`, `end`, `distance`, `slope` y `activity` se establecen en el constructor y se pueden modificar posteriormente. La propiedad `users` es una instancia de la clase `UniqueList`, que es una lista que solo permite valores únicos.

La clase `Track` también tiene un constructor que toma varios argumentos, incluyendo `id`, `name`, `start`, `end`, `distance`, `slope` y `activity`. Este constructor inicializa las propiedades correspondientes con los valores proporcionados.

### User.ts

```TypeScript
import { Activity } from './Activity.js'
import { Stats } from './Stats.js'
import { UniqueList } from './UniqueList.js'
import { Entry } from './Entry.js'

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

export class User<T = number> implements UserInterface<T> {
  public readonly id: number
  public name: string
  public activity: Activity
  public users: UniqueList<T> = new UniqueList<T>()
  public groups: UniqueList<T> = new UniqueList<T>()
  public stats: Stats = new Stats()
  public tracks: UniqueList<T> = new UniqueList<T>()
  public challenges: UniqueList<T> = new UniqueList<T>()
  public records: UniqueList<Entry<T>> = new UniqueList<Entry<T>>()

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
```

Este código define una interfaz `UserInterface` y una clase `User`.

La interfaz `UserInterface` define un objeto que tiene varias propiedades, incluyendo `name`, `activity`, `stats`, `users`, `groups`, `tracks`, `challenges` y `records`. Algunas de estas propiedades tienen tipos genéricos, lo que significa que pueden ser de cualquier tipo.

La clase `User` implementa la interfaz `UserInterface` y tiene varias propiedades públicas, incluyendo `id`, `name`, `activity`, `users`, `groups`, `stats`, `tracks`, `challenges` y `records`. Las propiedades `id`, `name` y `activity` se establecen en el constructor y se pueden modificar posteriormente. Las propiedades `users`, `groups`, `tracks`, `challenges` y `records` son instancias de la clase `UniqueList`, que es una lista que solo permite valores únicos. La propiedad `stats` es una instancia de la clase `Stats`, que se utiliza para almacenar estadísticas de actividad física.

El constructor de la clase `User` toma tres argumentos: `id`, `name` y `activity`. Este constructor inicializa las propiedades correspondientes con los valores proporcionados. También inicializa la propiedad `stats` con valores predeterminados para las estadísticas semanales, mensuales y anuales.

### Challenge.ts

Este fichero contiene una definición de la clase `Challenge` que implementa una interfaz llamada `ChallengeInterface`.

La propiedad `id` es de solo lectura y se establece en el constructor. La propiedad `name` es una cadena que representa el nombre del desafío. La propiedad `activity` es un objeto de la clase `Activity` que representa la actividad asociada con el desafío. Las propiedades `tracks` y `users` son listas de tipo genérico `T` que se implementan como objetos de la clase `UniqueList`.

```TypeScript
import { Activity } from './Activity.js'
import { UniqueList } from './UniqueList.js'

export interface ChallengeInterface<T = number> {
  name: string
  activity: Activity
  tracks: Array<T>
  users: Array<T>
}

export class Challenge<T = number> implements ChallengeInterface<T> {
  public readonly id: number
  public name: string
  public activity: Activity
  public tracks: UniqueList<T> = new UniqueList<T>()
  public users: UniqueList<T> = new UniqueList<T>()

  constructor(id, name, activity, ...tracks) {
    this.id = id
    this.name = name
    this.activity = activity
    for (const track of tracks) this.tracks.add(track)
  }
}
```

### Group.ts

Este fichero define la clase `Group` que implementa la interfaz `GroupInterface`. La interfaz `GroupInterface` define una estructura de datos que representa un grupo de usuarios y sus estadísticas de actividad física. Posee propiedades como `name`, `users`, `stats`, `tracks`, `records` y `ranking`, que representan el nombre del grupo, la lista de usuarios, las estadísticas de actividad física, las pistas, los registros y la clasificación de los usuarios en función de su actividad física.

En pos de la simplicidad, a continuación mostramos la **interfaz** de la clase aparte de los **métodos de clase**, no profundizamos en el constructor y los atributos de la clase ya que siguen la misma estructura de la interfaz.

```TypeScript
import { Stats } from './Stats.js'
import { UniqueList } from './UniqueList.js'
import { ExtendedEntry } from './Entry.js'

export interface GroupInterface<T = number> {
  name: string
  users: Array<T>
  stats: Stats
  ranking: Array<T>
  tracks: Array<T>
  records: Array<ExtendedEntry<T>>
}

export class Group<T = number> implements GroupInterface<T> {
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

  private convertToT(value: any): T | null {
    if (
      typeof value === 'string' &&
      typeof Number(value) === 'number' &&
      !isNaN(Number(value))
    )
      return Number(value) as T
    return null
  }
}
```

Como pueden observar, se han implementado dos métodos: el método `get ranking` se encarga de calcular el ranking de los usuarios en el grupo en función de los kilometros realizados por cada uno, sacando dicha información de los registros del grupo (se entiende que los miembros pueden participar o no en una salida del grupo); y el método `convertToT` se encarga de convertir un valor de tipo `any` a un valor de tipo `T` o `null` si no es posible. Este último se ha desarrollado para que la clase pueda trabajar con cualquier tipo de datos sin ningún problema.

### Models.ts

Aquí definiremos los modelos de Mongoose utilizados en el API. Cómo mencionamos realmente estos modelos son los que nos interesan para definir la estructura de datos.

Cada esquema de los modelos se ha implementado utilizando las mismas interfaces que se han definido en los ficheros anteriores.

Para crear el modelo correspondiente utilizando la función `model` de Mongoose. Por ejemplo, el modelo Track se crea utilizando `TrackModel = model<TrackInterface<string>>('Track', TrackSchema)`.

Cabe destacar que optamos por usar el nombre de cada entidad como único de manera que, por ejemplo, no puede haber dos usuarios con el mismo nombre.

Asimismo, se puede observar que en nungún momento se ha implementado un atributo `id` (aspecto que en las clases si se ha desarrollado). ¿Por qué? Sencillo, el objetivo de este campo ya lo proporciona la propiedad `_id` de los documentos de MongoDB. Por esta razón se han desarrollado todas las estructuras con plantillas.

```TypeScript
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

export const TrackModel = model<TrackInterface<string>>('Track', TrackSchema)

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
    ref: 'User',
    required: false,
  },
  groups: {
    type: Schema.Types.Mixed,
    ref: 'Group',
    required: false,
  },
  stats: {
    type: Array,
    required: false,
  },
  tracks: {
    type: Schema.Types.Mixed,
    ref: 'Track',
    required: false,
  },
  challenges: {
    type: Schema.Types.Mixed,
    ref: 'Challenge',
    required: false,
  },
  records: {
    type: Schema.Types.Mixed,
    required: false,
  },
})

export const UserModel = model<UserInterface<string>>('User', UserSchema)

export const GroupSchema = new Schema<GroupInterface<string>>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  users: {
    type: Schema.Types.Mixed,
    ref: 'User',
    required: false,
  },
  stats: {
    type: Array,
    required: false,
  },
  ranking: {
    type: Schema.Types.Mixed,
    ref: 'User',
    required: false,
  },
  tracks: {
    type: Schema.Types.Mixed,
    ref: 'Track',
    required: false,
  },
  records: {
    type: Schema.Types.Mixed,
    required: false,
  },
})

export const GroupModel = model<GroupInterface<string>>('Group', GroupSchema)

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
    ref: 'Track',
    required: false,
  },
  users: {
    type: Schema.Types.Mixed,
    ref: 'User',
    required: false,
  },
})

export const ChallengeModel = model<ChallengeInterface<string>>(
  'Challenge',
  ChallengeSchema
)
```

### Server.ts

```TypeScript
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
  private server: HttpServer = new HttpServer()
  public app: express.Application = express()

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
```

En primera instancia, además de añadir las importaciones necesarias, se define una constante llamada `routes` que contiene las rutas que se utilizarán en el servidor: `/tracks`, `/users`, `/groups` y `/challenges`. Notese como también se han añadido las rutas con `/:id` para poder hacer peticiones a un recurso concreto (por ejemplo, `/tracks/1`)

Se inicializa el atributo `server` que almacenará el servidor HTTP y el atributo `app` que almacenará la aplicación Express. Se define el constructor de la clase `Server` que inicializa la aplicación Express, define las rutas y define los métodos HTTP que se utilizarán en el servidor. En `this.app.use(express.json())` se define para que el servidor utilice JSON como formato de intercambio de datos.

En `this.defineGet()`, `this.definePost()`, `this.defineDelete()` y `this.definePatch()` se definen los métodos HTTP GET, POST, DELETE y PATCH, respectivamente. En `this.app.all('*', (_, res) => { res.status(501).send() })` se define que si se hace una petición a una ruta que no existe, se devuelva un código de estado 501.

```TypeScript
  private defineGet() {
    for (const route of routes) {
      this.app.get(route, (req, res) => {
        this.get(req, res)
          .then(() => {
            console.log('Get request completed')
          })
          .catch((err) => {
            console.log('Error in get request: ' + err)
          })
      })
    }
  }

  private definePost() {
    for (const route of routes) {
      this.app.post(route, (req, res) => {
        this.post(req, res)
          .then(() => {
            console.log('Post request completed')
          })
          .catch((err) => {
            console.log('Error in post request: ' + err)
          })
      })
    }
  }

  private defineDelete() {
    for (const route of routes) {
      this.app.delete(route, (req, res) => {
        this.delete(req, res)
          .then(() => {
            console.log('Delete request completed')
          })
          .catch((err) => {
            console.log('Error in delete request: ' + err)
          })
      })
    }
  }

  private definePatch() {
    for (const route of routes) {
      this.app.patch(route, (req, res) => {
        this.patch(req, res)
          .then(() => {
            console.log('Patch request completed')
          })
          .catch((err) => {
            console.log('Error in patch request: ' + err)
          })
      })
    }
  }
```

Ahora se han definido los cuatro métodos: `defineGet()`, `definePost()`, `defineDelete()` y `definePatch()`. Cada uno de ellos recorre la constante `routes` y define un método HTTP para cada ruta. Por ejemplo, `this.app.get(route, (req, res) => { this.get(req, res) ... })` define un método HTTP GET para cada ruta. En cada método HTTP se llama a un método privado que se encarga de realizar la operación correspondiente. Cada unno de estos métodos tiene exactamente la misma estructura, solo que cambia el método HTTP que se define.

```TypeScript
  public start(port: number | string): void {
    this.server = this.app.listen(port, () => {
      console.log(`Server listening on port ${port}`)
    })
  }

  public stop(): void {
    disconnect()
    this.server.close()
  }
```

Se inicializa el servidor HTTP en el puerto especificado y se muestra un mensaje por consola indicando que el servidor se ha iniciado. Se define un método `stop()` que se encarga de cerrar el servidor y desconectar la base de datos.

```TypeScript
  private get = async (req: express.Request, res: express.Response) => {
    connect(process.env.MONGODB_URL!)
      .then(() => {
        console.log('Connected to database ' + process.env.MONGODB_URL!)
        let model
        let url = req.url
        if (req.url.includes('?'))
          url = req.url.substring(0, req.url.indexOf('?'))
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
```

Este método se encarga de realizar una operación GET en la base de datos. En primer lugar, se conecta a la base de datos. A continuación, se comprueba la ruta a la que se ha hecho la petición y se asigna el modelo correspondiente a la variable `model`.

Si la ruta es `/tracks`, se asigna el modelo `TrackModel`, si la ruta es `/users`, se asigna el modelo `UserModel`, si la ruta es `/groups`, se asigna el modelo `GroupModel` y si la ruta es `/challenges`, se asigna el modelo `ChallengeModel`.

Si la ruta no es ninguna de las anteriores, se devuelve un código de estado 400. Si la ruta es `/tracks/:id`, se busca un documento en la base de datos con el identificador especificado en la ruta. Si la ruta es `/tracks?name=...`, se busca un documento en la base de datos con el nombre especificado en la ruta. Si la ruta es `/tracks`, se buscan todos los documentos de la base de datos. En cada caso, se llama al método `searchResult()` que se encarga de devolver el resultado de la búsqueda.

```TypeScript
  private post = async (req: express.Request, res: express.Response) => {
    connect(process.env.MONGODB_URL!)
      .then(() => {
        console.log('Connected to database ' + process.env.MONGODB_URL!)
        let document
        const url = req.url
        let body = req.body
        if (url.includes('?'))
          res.status(400).json({ message: 'Bad parameters' })
        try {
          switch (url) {
            case '/tracks':
              document = new TrackModel(body)
              this.createReferencesToTrack(document)
              break
            case '/users':
              document = new UserModel(body)
              this.createReferencesToUser(document)
              break
            case '/groups':
              body = this.updateRanking(body)
              document = new GroupModel(body)
              this.createReferencesToGroup(document)
              break
            case '/challenges':
              document = new ChallengeModel(body)
              this.createReferencesToChallenge(document)
              break
            default:
              break
          }
        } catch (err) {
          res.status(400).json({ message: 'Bad parameters', error: err })
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

  private createReferencesToTrack(document: any): void {
    UserModel.find({ _id: { $in: document.users } }).then((users) => {
      if (users && document.users && users.length !== document.users.length)
        throw new Error('User not found')
    })
    UserModel.updateMany(
      { _id: { $in: document.users } },
      { $push: { tracks: document._id } },
      { multi: true, runValidators: true }
    )
  }

  private createReferencesToUser(document: any): void {
    TrackModel.find({ _id: { $in: document.tracks } }).then((tracks) => {
      if (tracks && document.tracks && tracks.length !== document.tracks.length)
        throw new Error('Track not found')
    })
    TrackModel.updateMany(
      { _id: { $in: document.tracks } },
      { $push: { users: document._id } },
      { multi: true, runValidators: true }
    )
    ChallengeModel.find({ _id: { $in: document.challenges } }).then(
      (challenges) => {
        if (
          challenges &&
          document.challenges &&
          challenges.length !== document.challenges.length
        )
          throw new Error('Challenge not found')
      }
    )
    ChallengeModel.updateMany(
      { _id: { $in: document.challenges } },
      { $push: { users: document._id } },
      { multi: true, runValidators: true }
    )
    GroupModel.find({ _id: { $in: document.groups } }).then((groups) => {
      if (groups && document.groups && groups.length !== document.groups.length)
        throw new Error('Group not found')
    })
    GroupModel.updateMany(
      { _id: { $in: document.groups } },
      { $push: { users: document._id } },
      { multi: true, runValidators: true }
    )
  }

  private createReferencesToGroup(document: any): void {
    UserModel.find({ _id: { $in: document.users } }).then((users) => {
      if (users && document.users && users.length !== document.users.length)
        throw new Error('User not found')
    })
    UserModel.updateMany(
      { _id: { $in: document.users } },
      { $push: { groups: document._id } },
      { multi: true, runValidators: true }
    )
  }

  private createReferencesToChallenge(document: any): void {
    UserModel.find({ _id: { $in: document.users } }).then((users) => {
      if (users && document.users && users.length !== document.users.length)
        throw new Error('User not found')
    })
    UserModel.updateMany(
      { _id: { $in: document.users } },
      { $push: { challenges: document._id } },
      { multi: true, runValidators: true }
    )
  }
```

Este método se encarga de realizar una operación POST en la base de datos. En primer lugar, se conecta a la base de datos. A continuación, se comprueba la ruta a la que se ha hecho la petición y se asigna el modelo correspondiente a la variable `model`.

Si la ruta es `/tracks`, se asigna el modelo `TrackModel`, si la ruta es `/users`, se asigna el modelo `UserModel`, si la ruta es `/groups`, se asigna el modelo `GroupModel` y si la ruta es `/challenges`, se asigna el modelo `ChallengeModel`. Si la ruta no es ninguna de las anteriores, se devuelve un código de estado 400. Si la ruta es `/tracks`, se crea un documento de tipo `TrackModel` con el cuerpo de la petición y se llama al método `createReferencesToTrack()` que se encarga de crear las referencias a los usuarios que han realizado la actividad física.

Si la ruta es `/users`, se crea un documento de tipo `UserModel` con el cuerpo de la petición y se llama al método `createReferencesToUser()` que se encarga de crear las referencias a los grupos, desafíos y pistas en los que ha participado el usuario. Si la ruta es `/groups`, se crea un documento de tipo `GroupModel` con el cuerpo de la petición y se llama al método `createReferencesToGroup()` que se encarga de crear las referencias a los usuarios que pertenecen al grupo.

Si la ruta es `/challenges`, se crea un documento de tipo `ChallengeModel` con el cuerpo de la petición y se llama al método `createReferencesToChallenge()` que se encarga de crear las referencias a los usuarios que participan en el desafío. En cada caso, se llama al método `save()` que se encarga de guardar el documento en la base de datos.

```TypeScript
  private delete = async (req: express.Request, res: express.Response) => {
    connect(process.env.MONGODB_URL!)
      .then(() => {
        console.log('Connected to database ' + process.env.MONGODB_URL!)
        let model
        let url = req.url
        if (req.url.includes('?'))
          url = req.url.substring(0, req.url.indexOf('?'))
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

  private deleteReferencesFromUser(id: string): void {
    TrackModel.find({ users: { $in: [id] } }).then((tracks) => {
      tracks.forEach((track) => {
        track.users = new UniqueList<string>(
          ...track.users.filter((user) => user !== id)
        )
        track.save()
      })
    })
    UserModel.find({ users: { $in: [id] } }).then((users) => {
      users.forEach((user) => {
        user.users = new UniqueList<string>(
          ...user.users.filter((friend) => friend !== id)
        )
        user.save()
      })
    })
    GroupModel.find({ users: { $in: [id] } }).then((groups) => {
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
    ChallengeModel.find({ users: { $in: [id] } }).then((challenges) => {
      challenges.forEach((challenge) => {
        challenge.users = new UniqueList<string>(
          ...challenge.users.filter((user) => user !== id)
        )
      })
    })
  }
```

Este método se encarga de realizar una operación DELETE en la base de datos. En primer lugar, se conecta a la base de datos. A continuación, se comprueba la ruta a la que se ha hecho la petición y se asigna el modelo correspondiente a la variable `model`.

Si la ruta es `/tracks`, se asigna el modelo `TrackModel`, si la ruta es `/users`, se asigna el modelo `UserModel`, si la ruta es `/groups`, se asigna el modelo `GroupModel` y si la ruta es `/challenges`, se asigna el modelo `ChallengeModel`.

Si la ruta no es ninguna de las anteriores, se devuelve un código de estado 400. Si la ruta es `/tracks/:id`, se busca un documento en la base de datos con el identificador especificado en la ruta. Si la ruta es `/tracks?name=...`, se busca un documento en la base de datos con el nombre especificado en la ruta. Si la ruta es `/tracks`, se buscan todos los documentos de la base de datos.

En cada caso, se llama al método `searchResult()` que se encarga de devolver el resultado de la búsqueda. El método privado `deleteReferencesFromUser` se encarga de eliminar las referencias a un usuario que se ha eliminado de la base de datos. Obtiene los documentos de tipo `TrackModel`, `UserModel`, `GroupModel` y `ChallengeModel` que contienen al usuario y elimina las referencias.

```TypeScript
  private patch = async (req: express.Request, res: express.Response) => {
    connect(process.env.MONGODB_URL!)
      .then(() => {
        console.log('Connected to database ' + process.env.MONGODB_URL!)
        let model
        let url = req.url
        let body = req.body
        if (req.url.includes('?'))
          url = req.url.substring(0, req.url.indexOf('?'))
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
```

Este método se encarga de realizar una operación PATCH en la base de datos. En primer lugar, se conecta a la base de datos. A continuación, se comprueba la ruta a la que se ha hecho la petición y se asigna el modelo correspondiente a la variable `model`.

Si la ruta es `/tracks`, se asigna el modelo `TrackModel`, si la ruta es `/users`, se asigna el modelo `UserModel`, si la ruta es `/groups`, se asigna el modelo `GroupModel` y si la ruta es `/challenges`, se asigna el modelo `ChallengeModel`.

Si la ruta no es ninguna de las anteriores, se devuelve un código de estado 400. Si la ruta es `/tracks/:id`, se busca un documento en la base de datos con el identificador especificado en la ruta. Si la ruta es `/tracks?name=...`, se busca un documento en la base de datos con el nombre especificado en la ruta. Si la ruta es `/tracks`, se buscan todos los documentos de la base de datos.

En cada caso, se llama al método `searchResult()` que se encarga de devolver el resultado de la búsqueda. Si la ruta es `/groups`, se llama al método `updateRanking()` que se encarga de actualizar el ranking del grupo.

```TypeScript

  private searchResult(result: any, res: express.Response): void {
    if (!result) res.status(404).json({ message: 'Not found' })
    else res.status(200).json({ message: 'Found', result: result })
  }
```

El método privado `searchResult()` se encarga de devolver el resultado de la búsqueda. Si el resultado es nulo, se devuelve un código de estado 404 y mostrando un mensaje de que no se ha encontrado. Si el resultado no es nulo, se devuelve un código de estado 200, comprobando que se ha encontrado.

```TypeScript
  private updateRanking(body: any): any {
    const { id, name, users } = body
    const group = new Group(id, name, ...users)
    for (const record of body.records)
      record.users = new UniqueList(...record.users)
    group.records = new UniqueList<ExtendedEntry>(...body.records)
    const ranking = group.ranking.values
    body.ranking = ranking
    return body
  }
}
```

### main.ts

#### Código

```TypeScript
import { Server } from './Server.js'

function main() {
  new Server().start(3000)
}

main()
```

Este código define una función `main()` que crea una instancia de la clase `Server` y llama al método `start()` con el argumento 3000. Luego, la función `main()` se llama para iniciar el servidor.

La clase `Server` se utiliza para crear un servidor web utilizando Node.js y Express. El método `start()` se utiliza para iniciar el servidor en un puerto específico. En este caso, el servidor se iniciará en el puerto 3000.

La función `main()` es la función principal del programa y se llama para iniciar el servidor. Al llamar a la función `main()`, se crea una instancia de la clase `Server` y se inicia el servidor en el puerto 3000.

## Pruebas y cubrimiento

Han sido realiazadas pruebas con `mocha` y `chai`, con el fin de verificar el correcto funcionamiento de todos y cada uno de los ficheros del proyecto. A continuación, a través del fichero `Destravate.spec.ts`, se muestra la salida por pantalla tanto de las pruebas como del cubrimiento del código:

```console
[~/Destravate(main)]$npm run test

> prct12@1.0.0 test
> env-cmd -f ./config/test.env mocha --exit

(node:108429) ExperimentalWarning: Custom ESM Loaders is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)


Server listening on port 3000
  Destravate app tests
    Track class tests
      ✔ Track Objects should have an id
      ✔ Track Objects should have a name
      ✔ Track Objects should have a start and end points, and both should be Coordinates
      ✔ Track Objects should have a distance
      ✔ Track Objects should have a slope
      ✔ Track Objects should have a list of users that have done the track
      ✔ Track Objects should have an activity
      ✔ Track Objects should have a score
    User class tests
      ✔ User Objects should have an id
      ✔ User Objects should have a name
      ✔ User Objects should have an sport activity
      ✔ User Objects should have a list of users
      ✔ User Objects should be able to add users
      ✔ User Objects should be able to remove users
      ✔ User Objects should have a list of groups in which the user is
      ✔ User Objects should be able to add groups
      ✔ User Objects should be able to remove groups
      ✔ User Objects should have stats
      ✔ User Objects should be able to reset stats
      ✔ User Objects should have a list of favorite tracks
      ✔ User Objects should be able to add favorite tracks
      ✔ User Objects should be able to remove favorite tracks
      ✔ User Objects should have a list of active challenges
      ✔ User Objects should be able to add active challenges
      ✔ User Objects should be able to remove active challenges
      ✔ User Objects should have a record of the tracks done
      ✔ User Objects should be able to add records
      ✔ User Objects should know if the friend/group/favorite/challenge/record is in the list when adding
      ✔ User Objects should know if the friend/group/favorite/challenge/record is not in the list when removing
    Group class tests
      ✔ Group Objects should have an id
      ✔ Group Objects should have a name
      ✔ Group Objects should have a list of users
      ✔ Group Objects should be able to add users
      ✔ Group Objects should be able to remove users
      ✔ Group Objects should have stats
      ✔ Group Objects should be able to reset stats
      ✔ Group Objects should have a list of favorite tracks
      ✔ Group Objects should be able to add favorite tracks
      ✔ Group Objects should be able to remove favorite tracks
      ✔ Group Objects should have a record of the tracks done
      ✔ Group Objects should be able to add records
      ✔ Group Objects should know if the user/favorite/record is in the list when adding
      ✔ Group Objects should know if the user/favorite/record is not in the list when removing
      ✔ Group Objects should have a ranking
    Challenge class tests
      ✔ Challenge Objects should have an id
      ✔ Challenge Objects should have a name
      ✔ Challenge Objects should have an activity
      ✔ Challenge Objects should have a list of tracks that are part of the challenge
      ✔ Challenge Objects should be able to add tracks
      ✔ Challenge Objects should be able to remove tracks
      ✔ Challenge Objects should have a list of users that are part of the challenge
      ✔ Challenge Objects should be able to add users
      ✔ Challenge Objects should be able to remove users
      ✔ Challenge Objects should know if the user/track is in the list when adding
      ✔ Challenge Objects should know if the user/track is not in the list when removing
    Server class tests
      ✔ Servers should be able to make POST requests to the API (140ms)
      ✔ Servers should be able to make GET requests to the API (49ms)
      ✔ Servers should be able to make PATCH requests to the API
      ✔ Servers should be able to make DELETE requests to the API (46ms)


  59 passing (455ms)
```

También podemos comprobar el cubrimiento de código con Istanbul y Coveralls:

```console
---------------|---------|----------|---------|---------|-------------------------------------------------------------------
File           | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
---------------|---------|----------|---------|---------|-------------------------------------------------------------------
All files      |   92.63 |    82.44 |     100 |   92.63 |
 Activity.ts   |     100 |      100 |     100 |     100 |
 Challenge.ts  |     100 |      100 |     100 |     100 |
 Group.ts      |     100 |      100 |     100 |     100 |
 Models.ts     |     100 |      100 |     100 |     100 |
 Server.ts     |   84.04 |       77 |     100 |   84.04 | ...99-426,429,448-451,456-462,467-469,504,516,518-530,533,557-563
 Stats.ts      |     100 |      100 |     100 |     100 |
 Track.ts      |     100 |      100 |     100 |     100 |
 UniqueList.ts |     100 |      100 |     100 |     100 |
 User.ts       |     100 |      100 |     100 |     100 |
---------------|---------|----------|---------|---------|-------------------------------------------------------------------
```

Se ha procurado cubrir el mayor rango de código posible, pero hay ciertas partes del servidor que nos ha resultado laborioso y sobretodo que iba a llevar mucho tiempo, por lo que hemos optado por optimizar el tiempo y centrarnos en otras partes del servidor.

Asimismo cabe destacar que para realizar las pruebas se ha utilizado el método `request` de la librería `supertest` que nos permite realizar peticiones HTTP a nuestro servidor y comprobar que la respuesta es la esperada. Asimismo y como vimos en clases, tenemos que utilizar hooks para poder realizar las pruebas de forma asíncrona, ya que por ejemplo tenemos que asegurarnos de que la base de datos de `mongodb` se encuentre vacía a la hora de realizar las pruebas, ya que de otra manera pordría afectar a las mismas.

```TypeScript
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

after(async function () {
  await server.stop()
  await disconnect()
})
```

## Despliegue en Cyclic

Como se nos había solicitado, la API REST se encuentra desplegada en cyclic, en cada una de las cuentas personales de Github de los integrantes del equipo. En el vídeo entregado en el campus virtual procederemos a hacer pruebas en este entorno.

## Conclusión

Las API RESTS son una herramienta muy útil para poder comunicar diferentes aplicaciones entre sí, ya que nos permite hacer solicitudes HTTP a través de cualquier cliente como `Thunder Client` o `Postman` y obtener una respuesta en formato JSON. Asimismo, el despliegue de estas API RESTS en entornos como `Cyclic` nos permite tener un servidor en la nube que esté disponible las 24 horas del día, los 7 días de la semana, y que pueda ser accedido desde cualquier parte del mundo, sin necesidad de tener una base de datos local o un servidor local.

A lo largo del proyecto hemos afrontado varias adversidades y problemas sobretodo en las solicitudes al servidor pero hemos sido capaces de solventarlos y aprender de ellos.

## Referencias

- [Guión de la práctica 12.](https://ull-esit-inf-dsi-2223.github.io/prct12-destravate-api/)
- [Adam Freeman - Essential TypeScript 4: From Beginner to ProURL](https://www.oreilly.com/library/view/essential-typescript-4/9781484270110/html/Part_1.xhtml)
