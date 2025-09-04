import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to convert date to iCal format
const dateToICal = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

// Helper function to create iCal feed
const createICalFeed = (events: any[]): string => {
  const now = new Date();
  const calendarLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Maes-y-Morfa Primary School//School Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Maes-y-Morfa School Calendar',
    'X-WR-CALDESC:Official school calendar with events and important dates',
    'X-WR-TIMEZONE:Europe/London',
  ];

  events.forEach((event) => {
    try {
      const startDate = new Date(event.date);
      const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
      
      calendarLines.push(
        'BEGIN:VEVENT',
        `UID:${event.id}@maesymorfa.school`,
        `DTSTAMP:${dateToICal(now)}`,
        `DTSTART;VALUE=DATE:${startDate.toISOString().split('T')[0].replace(/-/g, '')}`,
        `DTEND;VALUE=DATE:${endDate.toISOString().split('T')[0].replace(/-/g, '')}`,
        `SUMMARY:${event.title_en || event.title}`,
        `DESCRIPTION:${(event.description_en || event.description || '').replace(/\n/g, '\\n')}`,
        event.location ? `LOCATION:${event.location}` : '',
        `LAST-MODIFIED:${dateToICal(event.lastEdited ? new Date(event.lastEdited) : now)}`,
        'END:VEVENT'
      );
    } catch (error) {
      console.error('Error processing event:', event.id, error);
    }
  });

  calendarLines.push('END:VCALENDAR');
  return calendarLines.filter(line => line !== '').join('\r\n');
};

export const handler: Handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'text/calendar; charset=utf-8',
    'Content-Disposition': 'inline; filename="school-calendar.ics"',
    'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: 'Method Not Allowed',
    };
  }

  try {
    // Fetch calendar events from Supabase
    const { data: events, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching calendar events:', error);
      return {
        statusCode: 500,
        headers,
        body: 'Error fetching calendar events',
      };
    }

    // Create iCal feed
    const icalContent = createICalFeed(events || []);

    return {
      statusCode: 200,
      headers,
      body: icalContent,
    };
  } catch (error) {
    console.error('Error generating calendar feed:', error);
    return {
      statusCode: 500,
      headers,
      body: 'Internal Server Error',
    };
  }
};