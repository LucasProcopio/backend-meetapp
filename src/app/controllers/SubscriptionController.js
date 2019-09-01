import { differenceInCalendarDays } from 'date-fns';
import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';
import Queue from '../../lib/Queue';
import User from '../models/User';
import SubscriptionMail from '../jobs/SubscriptionMail';

class SubscriptionController {
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
}

export default new SubscriptionController();
