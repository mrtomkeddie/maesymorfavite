import { createEvent, EventAttributes } from 'ics';
import { CalendarEvent } from './mockCalendar';

function dateToICal(dateStr: string): [number, number, number, number, number] {
  const date = new Date(dateStr);
  return [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes()];
}

export function createICalFile(event: CalendarEvent) {
  const icalEvent: EventAttributes = {
    title: event.title_en,
    start: dateToICal(event.start),
    description: event.description_en,
    calName: 'Maes Y Morfa School Calendar',
    productId: 'MorfaConnect/ICS',
  };

  if (event.end) {
    icalEvent.end = dateToICal(event.end);
  } else if (!event.allDay) {
    // Default to 1 hour duration if no end time is specified
    const startDate = new Date(event.start);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    icalEvent.end = dateToICal(endDate.toISOString());
  } else {
    // For all-day events, 'end' is not strictly required but good practice.
    // ICS can treat start date as the full day.
  }

  const { error, value } = createEvent(icalEvent);

  if (error) {
    console.error("Error creating iCal event:", error);
    return null;
  }

  return value;
}
