import Sequelize, { Model } from 'sequelize';
import { isBefore, parseISO } from 'date-fns';

class Meetup extends Model {
  static init(sequelize) {
    super.init(
      {
        user_id: Sequelize.INTEGER,
        file_id: Sequelize.INTEGER,
        title: Sequelize.STRING,
        description: Sequelize.STRING,
        city: Sequelize.STRING,
        state: Sequelize.STRING,
        address: Sequelize.STRING,
        date: Sequelize.DATE,
        past_date: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(parseISO(this.date), new Date());
          },
        },
      },
      {
        sequelize,
        tableName: 'meetup',
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id' });
    this.belongsTo(models.File, { foreignKey: 'file_id' });
  }
}

export default Meetup;
