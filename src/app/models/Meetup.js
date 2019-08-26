import Sequelize, { Model } from 'sequelize';

class Meetup extends Model {
  static init(sequelize) {
    super.init(
      {
        user_id: Sequelize.INTEGER,
        title: Sequelize.STRING,
        description: Sequelize.STRING,
        city: Sequelize.STRING,
        state: Sequelize.STRING,
        address: Sequelize.STRING,
        date: Sequelize.DATE,
        banner: Sequelize.STRING,
        banner_url: {
          type: Sequelize.VIRTUAL,
          get() {
            return `http://localhost:3333/meetup/banner/${this.banner}`;
          },
        },
      },
      {
        sequelize,
      }
    );

    return this;
  }
}

export default Meetup;
