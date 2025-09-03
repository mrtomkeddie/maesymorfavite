
export type CalendarTag = 'Holiday' | 'INSET' | 'Event' | 'Trip' | 'Parents Evening';

export type CalendarAttachment = {
    name: string;
    url: string;
    type: 'pdf' | 'image' | 'doc';
}

export type CalendarEvent = {
    id: string;
    title_en: string;
    title_cy: string;
    description_en?: string;
    description_cy?: string;
    start: string; // ISO 8601 format (e.g., "2024-09-05T09:00:00")
    end?: string; // ISO 8601 format
    allDay: boolean;
    tags: CalendarTag[];
    relevantTo?: ('All' | 'Nursery' | 'Reception' | 'Year 1' | 'Year 2' | 'Year 3' | 'Year 4' | 'Year 5' | 'Year 6')[];
    attachments: CalendarAttachment[]; // Can be deprecated for attachmentUrl
    attachmentUrl?: string;
    attachmentName?: string;
    isUrgent?: boolean;
    showOnHomepage?: boolean;
    published: boolean;
    linkedNewsPostId?: string; // ID of the news post if cross-posted
};

const getFutureDate = (daysToAdd: number, hour = 0, minute = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
}


const schoolHolidays = [
    {
        title_en: "Autumn Half Term",
        title_cy: "Gwyliau Hanner Tymor yr Hydref",
        start: "2024-10-28",
        end: "2024-11-01",
        tag: 'Holiday'
    },
    {
        title_en: "Christmas Holidays",
        title_cy: "Gwyliau'r Nadolig",
        start: "2024-12-23",
        end: "2025-01-03",
        tag: 'Holiday'
    },
    {
        title_en: "Spring Half Term",
        title_cy: "Gwyliau Hanner Tymor y Gwanwyn",
        start: "2025-02-17",
        end: "2025-02-21",
        tag: 'Holiday'
    },
    {
        title_en: "Easter Holidays",
        title_cy: "Gwyliau'r Pasg",
        start: "2025-04-07",
        end: "2025-04-21",
        tag: 'Holiday'
    },
    {
        title_en: "Summer Half Term",
        title_cy: "Gwyliau Hanner Tymor yr Haf",
        start: "2025-05-26",
        end: "2025-05-30",
        tag: 'Holiday'
    },
     {
        title_en: "Summer Holidays",
        title_cy: "Gwyliau'r Haf",
        start: "2025-07-22",
        end: "2025-08-31",
        tag: 'Holiday'
    }
];

const insetDays = [
    {
        title_en: "INSET Day - Staff Training",
        title_cy: "Diwrnod HMS - Hyfforddiant Staff",
        start: getFutureDate(30),
        tag: 'INSET'
    },
    {
        title_en: "INSET Day - Staff Training",
        title_cy: "Diwrnod HMS - Hyfforddiant Staff",
        start: "2025-01-06",
        tag: 'INSET'
    },
     {
        title_en: "INSET Day - Staff Training",
        title_cy: "Diwrnod HMS - Hyfforddiant Staff",
        start: "2025-04-22",
        tag: 'INSET'
    }
]

const otherEvents: Omit<CalendarEvent, 'id' | 'published' | 'allDay'>[] = [
    {
        title_en: "Year 6 Trip to Big Pit",
        title_cy: "Taith Blwyddyn 6 i'r Big Pit",
        description_en: "Year 6 pupils will be visiting the Big Pit National Coal Museum. Please ensure permission slips are returned by Friday.",
        description_cy: "Bydd disgyblion Blwyddyn 6 yn ymweld ag Amgueddfa Lofaol Genedlaethol Cymru. Sicrhewch fod slipiau caniatâd yn cael eu dychwelyd erbyn dydd Gwener.",
        start: getFutureDate(5, 9, 0),
        end: getFutureDate(5, 15, 30),
        tags: ['Trip'],
        relevantTo: ['Year 6'],
        attachments: [
            { name: "Big Pit Letter.pdf", url: "#", type: 'pdf'}
        ]
    },
    {
        title_en: "Parents Evening - Autumn Term",
        title_cy: "Noson Rieni - Tymor yr Hydref",
        description_en: "Book your appointment online to discuss your child's progress.",
        description_cy: "Archebwch eich apwyntiad ar-lein i drafod cynnydd eich plentyn.",
        start: getFutureDate(12, 16, 0),
        end: getFutureDate(12, 19, 0),
        tags: ['Parents Evening'],
        relevantTo: ['All'],
        attachments: []
    },
    {
        title_en: "Christmas Concert",
        title_cy: "Cyngerdd Nadolig",
        description_en: "Join us for an evening of festive songs and performances from the children.",
        description_cy: "Ymunwch â ni am noson o ganeuon a pherfformiadau Nadoligaidd gan y plant.",
        start: getFutureDate(22, 18, 0),
        end: getFutureDate(22, 19, 30),
        tags: ['Event'],
        relevantTo: ['All'],
        attachments: []
    }
]

const generatedEvents: CalendarEvent[] = [
    ...schoolHolidays.map((e, i) => ({
        id: `holiday_${i}`,
        ...e,
        start: e.start,
        end: e.end,
        allDay: true,
        tags: [e.tag] as CalendarTag[],
        relevantTo: ['All'],
        attachments: [],
        published: true
    })),
    ...insetDays.map((e, i) => ({
        id: `inset_${i}`,
        ...e,
        start: e.start,
        allDay: true,
        tags: [e.tag] as CalendarTag[],
        relevantTo: ['All'],
        attachments: [],
        published: true
    })),
    ...otherEvents.map((e, i) => ({
        id: `event_${i}`,
        ...e,
        allDay: false,
        published: true
    }))
];


export const calendarEvents: CalendarEvent[] = generatedEvents.sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime());

export const calendarTags: CalendarTag[] = ['Holiday', 'INSET', 'Event', 'Trip', 'Parents Evening'];
