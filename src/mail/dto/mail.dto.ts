import { Address, Attachment } from 'nodemailer/lib/mailer';

export class MailDTO {
  recipients: Address[];
  subject: string;
  html: string;
  attachments?: Attachment[];
}