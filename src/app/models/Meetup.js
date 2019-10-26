import Sequelize, { Model } from 'sequelize';
import { isBefore, parseISO } from 'date-fns';

class Meetup extends Model {
  static init(sequelize) {
    super.init(
      {
        title: Sequelize.STRING,
        description: Sequelize.STRING,
        location: Sequelize.STRING,
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
        tableName: 'meetups',
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id' });
    this.belongsTo(models.File, { foreignKey: 'file_id', as: 'banner' });
    this.hasMany(models.Subscription, {
      foreignKey: 'meetup_id',
      as: 'subscription',
    });
  }
}

export default Meetup;
