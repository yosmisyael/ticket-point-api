import { Address } from 'nodemailer/lib/mailer';

export class MailDTO {
  recipients: Address[];
  subject: string;
  html: string;
}