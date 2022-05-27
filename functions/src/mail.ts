import nodemailer from "nodemailer";
import {stringify, stringifyHTML} from "./formatter";
import {Apartment} from "./interface";


const TITLE = "Apartments Available:\nhttps://www.wexley100.com/models\n\n";
const HTML_TITLE = "<h3>Apartments Available:</h3><a href='https://www.wexley100.com/models'>Website</a><br/><br/>";

const Mailer = class {
    private readonly senderEmail: string;
    private readonly senderPassword: string;

    /**
     * Constructor for a Mailer
     * @param {string} senderEmail The email of the sender
     * @param {string} senderPassword The password of the sender
     */
    constructor(senderEmail: string, senderPassword: string) {
      this.senderEmail = senderEmail;
      this.senderPassword = senderPassword;
    }

    /**
     * Sends an email of apartments
     * @param {string} apartments The apartments list
     * @param {string} receiverEmails The list of receiver emails
     * @return {Promise<SMTPTransport.SentMessageInfo>}
     * The result of sending mail
     */
    async sendEmail(apartments: Apartment[], receiverEmails: string) {
      console.log("Sending email...");

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: this.senderEmail,
          pass: this.senderPassword,
        },
      });

      const mailOptions = {
        from: "\"Apartment Notifier Pigeon 🏡🐥\" <notify@webscraper.com>",
        to: receiverEmails,
        subject: "Apartment Available!",
        text: TITLE + apartments.map(stringify).join("\n"),
        html: HTML_TITLE + apartments.map(stringifyHTML).join("<br/>"),
      };

      // send mail with defined transport object
      return await transporter.sendMail(mailOptions);
    }
};

export default Mailer;
