/** A notification row as rendered in the notifications list. */
export class NotificationDisplay {
  text!: string;
  type!: string;
  icon!: string;
  read!: boolean;
  date!: string;
  action: any;
}
