import * as Yup from 'yup';
import Meetup from '../models/Meetup';

class MeetupController {
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      city: Yup.string().required(),
      state: Yup.string().required(),
      address: Yup.string().required(),
    });

    return res.json();
  }
}

export default new MeetupController();
