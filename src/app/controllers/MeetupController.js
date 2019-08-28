import * as Yup from 'yup';
import fs from 'fs';
import { promisify } from 'util';
import { isBefore, parseISO } from 'date-fns';

import Meetup from '../models/Meetup';

class MeetupController {
  async store(req, res) {
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
      file_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    /**
     * Schema validation
     */
    if (!(await schema.isValid(req.body))) {
      await promisify(fs.unlink)(req.file.path);

      return res.status(401).json({ error: 'The data is not valid!' });
    }

    /**
     * Past date validation
     */
    if (isBefore(parseISO(req.body.date), new Date())) {
      await promisify(fs.unlink)(req.file.path);

      return res.status(401).json({
        error: 'The date cannot be in the past unless you use a timemachine ;)',
      });
    }

    const meetupData = await Meetup.create({
      ...req.body,
      user_id: req.userId,
    });

    return res.json(meetupData);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      city: Yup.string(),
      state: Yup.string().max(2),
      address: Yup.string(),
      file_id: Yup.number(),
      date: Yup.date(),
    });

    /**
     *  Date validation
     */
    if (isBefore(parseISO(req.body.date), new Date())) {
      return res
        .status(400)
        .json({ error: 'You cannot set the meetup date to the past' });
    }

    /**
     * Schema validation
     */
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'The date is not valid' });
    }

    /**
     * Meetup update authorization
     */
    const meetup = await Meetup.findByPk(req.params.id);
    if (req.userId !== meetup.user_id) {
      return res
        .status(400)
        .json({ error: 'Not authorized to update this meetup' });
    }

    /**
     * Past date validation
     */
    if (meetup.past_date) {
      return res.status(400).json({
        error: 'You cannot update a past event',
      });
    }

    const updatedData = await meetup.update(req.body);
    return res.json(updatedData);
  }
}

export default new MeetupController();
