import User from '../models/User';
import Meetup from '../models/Meetup';
import File from '../models/File';

class OrganizerContoller {
  async index(req, res) {
    const meetup = await Meetup.findAll({
      where: {
        user_id: req.userId,
      },
      order: ['date'],
      attributes: [
        'id',
        'title',
        'description',
        'city',
        'state',
        'address',
        'date',
      ],
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
        {
          model: File,
          attributes: ['url', 'name', 'path'],
          as: 'banner',
        },
      ],
    });
    return res.json(meetup);
  }
}

export default new OrganizerContoller();