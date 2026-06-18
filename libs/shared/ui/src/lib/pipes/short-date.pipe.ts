import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs';

@Pipe({ name: 'shortDate', standalone: true })
export class ShortDatePipe implements PipeTransform {
  transform(inputDate: Date): string {
    inputDate = new Date(inputDate);
    const today = dayjs(new Date());

    const minutes = today.diff(inputDate, 'minutes');
    const hours = today.diff(inputDate, 'hours');
    const days = today.diff(inputDate, 'days');
    const weeks = today.diff(inputDate, 'weeks');
    const months = today.diff(inputDate, 'months');
    const years = today.diff(inputDate, 'years');

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return minutes + ' min';
    if (hours < 2) return hours + ' h';
    if (hours < 24) return hours + ' hs';
    if (days < 7) return days + ' d';
    if (weeks < 7) return weeks + ' sem';
    if (months < 12) return months + ' m';
    if (years < 2) return years + ' ano';
    return years + ' anos';
  }
}
