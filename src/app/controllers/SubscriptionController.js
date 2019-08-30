import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';

class SubscriptionController {
  async store(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

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

    if (isSubscried.length > 0) {
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

    const subscription = await Subscription.create({
      user_id: req.userId,
      meetup_id: req.params.id,
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();
