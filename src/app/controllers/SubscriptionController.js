import {
  differenceInCalendarDays,
  subDays,
  isBefore,
  subHours,
} from 'date-fns';
import { Op } from 'sequelize';

import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';
import User from '../models/User';
import File from '../models/File';

import Queue from '../../lib/Queue';
import SubscriptionMail from '../jobs/SubscriptionMail';

class SubscriptionController {
  async index(req, res) {
    /**
     * Meetups subscription list
     */
    const subscriptions = await Meetup.findAll({
      where: { date: { [Op.gte]: subDays(new Date(), 1) } },
      attributes: ['id', 'title', 'description', 'location', 'date', 'file_id'],
      order: ['date'],
      include: [
        {
          model: Subscription,
          where: { user_id: req.userId },
          attributes: ['id'],
          as: 'subscription',
        },
        {
          model: User,
          attributes: ['id', 'name'],
        },
        {
          model: File,
          attributes: ['url', 'path'],
          as: 'banner',
        },
      ],
    });

    return res.json(subscriptions);
  }

  async store(req, res) {
    const meetup = await Meetup.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['name', 'email'],
        },
      ],
    });

    /**
     * Meetup Organizer validation
     */
    if (meetup.user_id === req.userId) {
      return res
        .status(401)
        .json({ error: 'Organizer subscriptions are not permitted' });
    }

    /**
     *  Past meetups validation
     */
    if (meetup.past_date) {
      return res
        .status(401)
        .json({ error: 'Subscriptions to past meetups are not permitted' });
    }

    /**
     * Already subscribed validation
     */
    const isSubscried = await Subscription.findOne({
      where: {
        meetup_id: req.params.id,
        user_id: req.userId,
      },
    });

    if (isSubscried) {
      return res
        .status(401)
        .json({ error: 'Already subscribed for this meetup' });
    }

    /**
     * Same date meetup validation
     */
    const verifyDate = await Subscription.findOne({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (verifyDate) {
      return res.status(401).json({
        error:
          'Subscriptions to more than one meetup at the same date is not permitted',
      });
    }

    /**
     * Create meetup subscription
     */
    const subscription = await Subscription.create({
      user_id: req.userId,
      meetup_id: req.params.id,
    });

    /**
     * subscriber data
     */
    const { name, email } = await User.findByPk(req.userId);

    /**
     * total subscriptions for the meetup
     */
    const { count: totalSubs } = await Subscription.findAndCountAll({
      where: { meetup_id: req.params.id },
    });

    /**
     * Remaining days for the meetup to happen
     */
    const daysRemaining = differenceInCalendarDays(meetup.date, new Date());
    const daysRemainingInfo =
      daysRemaining > 0
        ? `Meetup countdown: ${daysRemaining} days remaining.`
        : 'The meetup happens today!!!';

    /**
     * E-mail dispatcher using Queues
     */
    await Queue.add(SubscriptionMail.key, {
      meetup,
      name,
      email,
      totalSubs,
      daysRemainingInfo,
    });

    return res.json(subscription);
  }

  async delete(req, res) {
    /**
     * Subscription validation
     */
    const subscription = await Subscription.findOne({
      where: {
        id: req.params.id,
        user_id: req.userId,
      },
    });

    if (!subscription) {
      return res
        .status(401)
        .json({ error: 'Cannot cancel meetups that you are not subscribbed' });
    }

    /**
     * Validation to delete only meetups with more than 24 hours in advance
     */
    const meetup = await Meetup.findByPk(subscription.meetup_id);

    const subDate = subHours(meetup.date, 24);

    if (isBefore(subDate, new Date())) {
      return res.status(401).json({
        error: 'You can only cancel meetups subscriptions 24 Hours in advance.',
      });
    }

    const deleted = await Subscription.destroy({
      where: { id: subscription.id },
    });

    return res.json(deleted);
  }
}

export default new SubscriptionController();
