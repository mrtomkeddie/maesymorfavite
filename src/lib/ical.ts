import { createEvents, EventAttributes } from 'ics';
import { CalendarEvent } from './mockCalendar';

function dateToICal(dateStr: string): [number, number, number, number, number] {
  const date = new Date(dateStr);
  return [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes()];
}

export function createICalFeed(events: CalendarEvent[]) {
  const icalEvents: EventAttributes[] = events.map(event => {
    const icalEvent: EventAttributes = {
      title: event.title_en,
      start: dateToICal(event.start),
      description: event.description_en,
      calName: 'Maes Y Morfa School Calendar',
      productId: 'ParentPortal/ICS',
    };

    if (event.end) {
      icalEvent.end = dateToICal(event.end);
    } else if (!event.allDay) {
      // Default to 1 hour duration if no end time is specified
      const startDate = new Date(event.start);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      icalEvent.end = dateToICal(endDate.toISOString());
    }
    
    return icalEvent;
  });

  const { error, value } = createEvents(icalEvents);

  if (error) {
    console.error("Error creating iCal feed:", error);
    return null;
  }

  return value;
}
