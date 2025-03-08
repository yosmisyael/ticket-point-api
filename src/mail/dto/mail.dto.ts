import { Address } from 'nodemailer/lib/mailer';

export class MailDTO {
  sender?: Address;
  recipients: Address[];
  subject: string;
  html: string;
}