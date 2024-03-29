import * as Yup from 'yup';
import { Op } from 'sequelize';
import { isBefore, parseISO, startOfDay, endOfDay, subHours } from 'date-fns';

import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const perpage = 10;
    const where = {};

    if (req.query.date) {
      const date = parseISO(req.query.date);

      where.date = {
        [Op.between]: [startOfDay(date), endOfDay(date)],
      };
    }

    const meetup = await Meetup.findAll({
      where,
      order: ['date'],
      attributes: ['id', 'title', 'description', 'location', 'date'],
      limit: perpage,
      offset: (page - 1) * perpage,
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
        {
          model: File,
          attributes: ['id', 'url', 'name', 'path'],
          as: 'banner',
        },
      ],
    });
    return res.json(meetup);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      file_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    /**
     * Schema validation
     */
    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({
        error:
          'The data is not valid!, make sure all fields are filled correctly',
      });
    }

    /**
     * Past date validation
     */
    if (isBefore(parseISO(req.body.date), new Date())) {
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
      location: Yup.string(),
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
        .status(401)
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

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    /**
     * User authorization
     */
    if (meetup.user_id !== req.userId) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    /**
     * past meetups cancelation validation
     */
    if (meetup.past_date) {
      return res.status(400).json({ error: 'Cannot cancel past meetups' });
    }

    /**
     * Validation to delete only meetups with more than 24 hours in advance
     */
    const subDate = subHours(meetup.date, 24);
    if (isBefore(subDate, new Date())) {
      return res.status(401).json({
        error: 'You can only cancel meetups 24 Hours in advance.',
      });
    }

    const deleted = await Meetup.destroy({ where: { id: meetup.id } });

    return res.json(deleted);
  }
}

export default new MeetupController();
