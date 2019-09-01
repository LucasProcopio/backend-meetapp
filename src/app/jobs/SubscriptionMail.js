import { format } from 'date-fns';
import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { meetup, name, email, totalSubs, daysRemainingInfo } = data;

    /**
     * Send subscription email
     */
    await Mail.sendMail({
      to: `${meetup.User.name} <${meetup.User.email}>`,
      subject: `New meetup subscription`,
      template: 'subscription',
      context: {
        meetupTitle: meetup.title,
        name,
        email,
        subsDate: format(new Date(), "MMM', 'do yyyy' At: 'HH':'MM"),
        totalSubs,
        daysRemainingInfo,
      },
    });
  }
}

export default new SubscriptionMail();
