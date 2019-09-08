# lumeet-app
* An event aggregator API for developers LuMeetApp (Meetup + App)

---

### Installation

- Download or clone this repository
- At the root folder of this project run the followin command `npm install` or `yarn` to install all dependencies
- This app was created using **[docker](https://www.docker.com/)**
  - install docker and create containers before starting
  - create a postgres, redis:alpine and a mongo container using docker
- create a **.env** file at the root folder of the application and set all the required values before running the app
there is a **.env_example** file
- Start the server by running `yarn dev` or `npm dev`
- Start the mailing server by running `yarn queue` or `npm queue`

---

### API Endpoint

The following endpoints are available:

| **Endpoints**               |                        **Usage**                         |                                                **Params**                                                |
| :-------------------------- | :------------------------------------------------------: | :------------------------------------------------------------------------------------------------------: |
| `POST /users`                |                   Create users                  |   **name**, **email**, **password**                                                                                                       |
| `PUT /users`            |             Update logged user data                |    _optional:_ **name**, **email**, _required to change password:_ **oldPassword**, **password**, **confirmPassword**                                                 |
| `POST /session`               |                  Create a user session **login**                   |                                        **email**, **password**                                        |
| `POST /files`           |                      Upload an image file                      |    file: multipart forma data                                                                    |
| `GET /meetups/organizer`         |                     Get list of organizer meetups                      |                                                                                 |
| `GET /meetups`           |                   Get list meetups                   |            _query params:_ **page** , **date** _ex: 2019-02-10_                                                                            |
| `DELETE /meetups/:id`              |                    Delete a meetup                   |                                                 |
| `POST /meetups`           |                     Create a meetup                     |                     **title**, **description** , **city**, **state**, **address**,  **date** _ex: 2020-05-12T05:30:00-03:00_, **file_id**                      |
| `PUT /meetups/:id`         |          Update a meetup          |         **title**, **description**, **city**, **date** _ex: 2020-05-12T05:30:00-03:00_, **address**                                                                                                 |


### License

**MIT** click [Here](https://opensource.org/licenses/MIT) to know more.
