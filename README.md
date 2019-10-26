# lumeet-app

- An event aggregator API for developers LuMeetApp (Meetup + App)

---

### Installation

- Download or clone this repository

- This app was created using **[docker](https://www.docker.com/)**

  - install docker and create containers before starting
  - create a postgres and redis:alpine containers

---

### Docker

- to create a redis:alpine container run

```sh
docker run --name redismeetup -p 6379:6379 -d -t redis:alpine
```

- to create a postgres database container run

```sh
docker run --name database -e POSTGRES_PASSWORD=docker -p 5432:5432 -d postgres
```

- create a **.env** file at the root folder of the application and set all the values before running the app there is a **.env_example** file to follow along

- when using a mobile device to fetch data on local server make sure you set your **IP ADDR** instead of _localhost_ on the APP_URL **.env** and the device is connected at the same network as your local server.

### Usage

- before starting the application run the command below to install all dependencies

```sh
yarn
```

- create a **database** with the same name set in the `.env` file make sure you use encoding UTF8
  - run yarn sequelize db:migrate
- Start the server by running `yarn dev`
- Start the mailing server by running `yarn queue`

---

### API Endpoint

The following endpoints are available:

| **Endpoints**              |              **Usage**              |                                                      **Params**                                                      |
| :------------------------- | :---------------------------------: | :------------------------------------------------------------------------------------------------------------------: |
| `POST /users`              |            Create users             |                                          **name**, **email**, **password**                                           |
| `PUT /users`               |       Update logged user data       |  _optional:_ **name**, **email** _required to change password:_ **oldPassword**, **password**, **confirmPassword**   |
| `POST /session`            |   Create a user session **login**   |                                               **email**, **password**                                                |
| `POST /files`              |        Upload an image file         |                                              file: multipart forma data                                              |
| `GET /meetups/organizer`   |    Get list of organizer meetups    |                                                                                                                      |
| `GET /meetups`             |          Get list meetups           |                                 _query params:_ **page** , **date** _ex: 2019-02-10_                                 |
| `DELETE /meetups/:id`      |           Delete a meetup           |                                                                                                                      |
| `POST /meetups`            |           Create a meetup           | **title**, **description** , **city**, **state**, **address**, **date** _ex: 2020-05-12T05:30:00-03:00_, **file_id** |
| `PUT /meetups/:id`         |           Update a meetup           |       **title**, **description**, **city**, **date** _ex: 2020-05-12T05:30:00-03:00_, **address**, **file_id**       |
| `POST /subscribe/:id`      |        Subscribe to a meetup        |                                                                                                                      |
| `DELETE /subscription/:id` | Cancel user subsription to a meetup |                                                                                                                      |
| `GET /subscriptions`       |   get the user subscription list    |                                                                                                                      |

### License

**MIT** click [Here](https://opensource.org/licenses/MIT) to know more.
