import * as Yup from 'yup';
import fs from 'fs';
import { promisify } from 'util';
import { isBefore, parseISO } from 'date-fns';

import Meetup from '../models/Meetup';
import File from '../models/File';

class MeetupController {
  async store(req, res) {
    const { originalname: name, filename: path } = req.file;
    const { date } = req.body;

    if (isBefore(parseISO(date), new Date())) {
      await promisify(fs.unlink)(req.file.path);
      return res.status(401).json({
        error: 'The date cannot be in the past unless you use a timemachine ;)',
      });
    }

    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      city: Yup.string().required(),
      state: Yup.string().test(
        'length',
        'Must be exactly 2 characters',
        str => str.length === 2
      ),
      address: Yup.string().required(),
      date: Yup.date().required(),
      name: Yup.string().required(),
      path: Yup.string().required(),
    });

    if (!(await schema.isValid({ ...req.body, name, path }))) {
      await promisify(fs.unlink)(req.file.path);

      return res.status(401).json({ error: 'The data is not valid!' });
    }

    const { id: fileId } = await File.create({
      name,
      path,
    });

    const meetupData = await Meetup.create({
      ...req.body,
      user_id: req.userId,
      file_id: fileId,
    });

    return res.json(meetupData);
  }
}

export default new MeetupController();
