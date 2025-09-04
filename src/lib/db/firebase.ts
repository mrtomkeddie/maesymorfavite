
// Mock database implementation for development and testing
import type { NewsPost } from "@/lib/mockNews";
import type { CalendarEvent } from "@/lib/mockCalendar";
import type { StaffMember, StaffMemberWithId, Document, DocumentWithId, Parent, ParentWithId, Child, ChildWithId, SiteSettings, LinkedParent, InboxMessage, InboxMessageWithId, Photo, PhotoWithId, DailyMenu, WeeklyMenu, UserWithRole, UserRole, ParentNotification, ParentNotificationWithId } from "@/lib/types";
import { yearGroups } from "@/components/admin/ChildForm";
import { news as mockNewsData } from '@/lib/mockNews';
import { calendarEvents as mockCalendarEvents } from '@/lib/mockCalendar';
import { generateMockData, parentChildren } from '@/lib/mockData';
// Content lifecycle import removed - only homepage filtering remains

// === IN-MEMORY STORES FOR PERSISTENT MOCK DATA ===
let mockNewsStore: NewsPostWithId[] = [];
let mockCalendarStore: CalendarEventWithId[] = [];
let mockStaffStore: StaffMemberWithId[] = [];
let mockParentsStore: ParentWithId[] = [];
let mockChildrenStore: ChildWithId[] = [];
let mockInboxStore: InboxMessageWithId[] = [];
let mockDocumentsStore: DocumentWithId[] = [];
let mockPhotosStore: PhotoWithId[] = [];
let mockNotificationsStore: ParentNotificationWithId[] = [];
let storesInitialized = false;

// Initialize all stores on first access
const initializeStores = () => {
    if (storesInitialized) return;
    
    // Initialize news store
    mockNewsStore = mockNewsData.map((post, index) => ({
        ...post,
        id: `mock_news_${index}`,
    }));
    
    // Initialize calendar store
    mockCalendarStore = mockCalendarEvents.map((event, index) => ({
        ...event,
        id: `mock_cal_${index}`,
    }));
    
    // Initialize other stores
    const { mockParents, mockChildren } = generateMockData();
    mockParentsStore = mockParents;
    mockChildrenStore = mockChildren;
    
    mockStaffStore = [
        // Leadership Team
        { id: '1', name: 'Jane Morgan', role: 'Headteacher', team: 'Leadership Team', email: 'jane.morgan@example.com', userId: 'mock-admin-id-1', bio: 'Jane has been leading Maes Y Morfa for over 8 years, bringing a passion for bilingual education and community engagement. She holds a Masters in Educational Leadership from Cardiff University.' },
        { id: '2', name: 'Alex Evans', role: 'Deputy Head', team: 'Leadership Team', email: 'alex.evans@example.com', bio: 'Alex supports the headteacher in strategic planning and curriculum development. With 15 years of teaching experience, he specializes in mathematics and STEM education.' },
        { id: '3', name: 'Ceri Lloyd', role: 'SENCo', team: 'Leadership Team', email: 'ceri.lloyd@example.com', bio: 'Ceri is our Special Educational Needs Coordinator, ensuring every child receives the support they need to thrive. She has extensive training in autism spectrum support and dyslexia intervention.' },
        
        // Teaching Staff - Year Groups
        { id: '4', name: 'David Williams', role: 'Teacher', team: 'Year 6', email: 'david.williams@example.com', userId: 'mock-teacher-id-1', bio: 'David teaches Year 6 and is passionate about preparing children for their transition to secondary school. He runs the school football team and organizes annual residential trips.' },
        { id: '5', name: 'Sarah Davies', role: 'Teacher', team: 'Year 1', email: 'sarah.davies@example.com', bio: 'Sarah brings creativity and enthusiasm to Year 1, helping children develop their love of reading and writing. She specializes in phonics and early literacy development.' },
        { id: '6', name: 'Tomos Jones', role: 'Teacher', team: 'Year 2', email: 'tomos.jones@example.com', bio: 'Tomos is a Welsh-speaking teacher who helps children develop their bilingual skills. He coordinates the school eisteddfod and Welsh cultural activities.' },
        { id: '7', name: 'Emily Roberts', role: 'Teacher', team: 'Year 3', email: 'emily.roberts@example.com', bio: 'Emily teaches Year 3 and has a particular interest in science and outdoor learning. She runs the school garden club and environmental projects.' },
        { id: '8', name: 'Megan Phillips', role: 'Teacher', team: 'Year 4', email: 'megan.phillips@example.com', bio: 'Megan is passionate about history and geography, bringing the past to life for Year 4 pupils. She organizes educational visits to local historical sites.' },
        { id: '9', name: 'Owain Thomas', role: 'Teacher', team: 'Year 5', email: 'owain.thomas@example.com', bio: 'Owain teaches Year 5 and coordinates the school music program. He plays guitar and piano, and leads the school choir in local competitions.' },
        { id: '10', name: 'Ffion Hughes', role: 'Teacher', team: 'Nursery & Reception', email: 'ffion.hughes@example.com', bio: 'Ffion works with our youngest learners in Reception, creating a nurturing environment where children develop confidence and independence through play-based learning.' },
        { id: '11', name: 'Gareth Price', role: 'Teacher', team: 'Nursery & Reception', email: 'gareth.price@example.com', bio: 'Gareth teaches in our Nursery, helping children take their first steps in education. He has specialized training in early years development and forest school activities.' },
        
        // Teaching Assistants
        { id: '12', name: 'Rhiannon Price', role: 'Teaching Assistant', team: 'Year 1', email: 'rhiannon.price@example.com', bio: 'Rhiannon supports learning in Year 1, with particular expertise in supporting children with additional learning needs. She has been with the school for 12 years.' },
        { id: '13', name: 'Bethan Morris', role: 'Teaching Assistant', team: 'Year 2', email: 'bethan.morris@example.com', bio: 'Bethan assists in Year 2 and runs the breakfast club. She is trained in first aid and helps coordinate school trips and activities.' },
        { id: '14', name: 'Carys Williams', role: 'Teaching Assistant', team: 'Year 3', email: 'carys.williams@example.com', bio: 'Carys works closely with Year 3 pupils, providing additional support in literacy and numeracy. She also helps run the after-school homework club.' },
        { id: '15', name: 'Gethin Davies', role: 'Teaching Assistant', team: 'Year 4', email: 'gethin.davies@example.com', bio: 'Gethin supports Year 4 learning and has a background in sports coaching. He assists with PE lessons and runs lunchtime sports activities.' },
        { id: '16', name: 'Lowri Evans', role: 'Teaching Assistant', team: 'Year 5', email: 'lowri.evans@example.com', bio: 'Lowri provides learning support in Year 5 and coordinates the school library. She has a passion for children\'s literature and runs storytelling sessions.' },
        { id: '17', name: 'Ieuan Roberts', role: 'Teaching Assistant', team: 'Year 6', email: 'ieuan.roberts@example.com', bio: 'Ieuan works with Year 6 pupils, providing additional support for those preparing for secondary school. He has experience in mentoring and pastoral care.' },
        { id: '18', name: 'Nia Jenkins', role: 'Teaching Assistant', team: 'Nursery & Reception', email: 'nia.jenkins@example.com', bio: 'Nia supports our youngest learners in the early years, helping with personal care and learning activities. She is trained in pediatric first aid.' },
        
        // Support Staff
        { id: '19', name: 'Mark Phillips', role: 'Office Manager', team: 'Support Staff', email: 'mark.phillips@example.com', bio: 'Mark manages the school office and handles administrative duties, parent communications, and financial records. He has been with the school for 6 years.' },
        { id: '20', name: 'Lisa Thomas', role: 'School Secretary', team: 'Support Staff', email: 'lisa.thomas@example.com', bio: 'Lisa is the friendly face that greets visitors and handles daily administrative tasks. She coordinates school events and maintains pupil records.' },
        { id: '21', name: 'Dafydd Morgan', role: 'Caretaker', team: 'Support Staff', email: 'dafydd.morgan@example.com', bio: 'Dafydd maintains our school buildings and grounds, ensuring a safe and welcoming environment for all. He has been caring for the school for over 15 years.' },
        { id: '22', name: 'Sian Edwards', role: 'Kitchen Manager', team: 'Support Staff', email: 'sian.edwards@example.com', bio: 'Sian leads our kitchen team, preparing nutritious meals for pupils and staff. She focuses on using local ingredients and accommodating dietary requirements.' },
        { id: '23', name: 'Rhys Williams', role: 'Kitchen Assistant', team: 'Support Staff', email: 'rhys.williams@example.com', bio: 'Rhys assists in the kitchen and helps serve meals to pupils. He enjoys interacting with the children and ensuring they have a positive dining experience.' },
        { id: '24', name: 'Cerys Jones', role: 'Cleaner', team: 'Support Staff', email: 'cerys.jones@example.com', bio: 'Cerys helps maintain the cleanliness and hygiene of our school facilities, working diligently to provide a healthy environment for learning.' },
        
        // Specialist Staff
        { id: '25', name: 'Huw Davies', role: 'PE Teacher', team: 'Support Staff', email: 'huw.davies@example.com', bio: 'Huw teaches physical education across all year groups and coordinates school sports teams. He has coaching qualifications in football, rugby, and athletics.' },
        { id: '26', name: 'Angharad Lloyd', role: 'Music Teacher', team: 'Support Staff', email: 'angharad.lloyd@example.com', bio: 'Angharad teaches music throughout the school and directs the school choir. She plays multiple instruments and organizes the annual school concert.' },
        { id: '27', name: 'Gareth Hughes', role: 'ICT Coordinator', team: 'Support Staff', email: 'gareth.hughes@example.com', bio: 'Gareth manages the school\'s technology resources and teaches computing skills. He ensures all staff and pupils can effectively use digital tools for learning.' },
        { id: '28', name: 'Mari Roberts', role: 'Learning Support Assistant', team: 'Support Staff', email: 'mari.roberts@example.com', bio: 'Mari provides specialized support for pupils with additional learning needs, working across different year groups as required.' }
    ];
    
    // Initialize inbox messages
    mockInboxStore = [
        {
            id: 'msg_1',
            type: 'absence',
            subject: 'Absence Report for Charlie K.',
            body: 'Charlie is unwell today.',
            sender: { id: 'parent-1', name: 'Jane Doe', email: 'parent@example.com', type: 'parent' },
            recipient: { id: 'admin-1', name: 'Admin', email: 'admin@example.com', type: 'admin' },
            isReadByAdmin: false,
            isReadByParent: true,
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            threadId: 'thread-1',
        },
        {
            id: 'reply-1',
            type: 'reply',
            subject: 'Re: Absence Report for Charlie K.',
            body: 'Thank you for letting us know. We hope Charlie feels better soon.',
            sender: { id: 'admin-1', name: 'Admin', email: 'admin@example.com', type: 'admin' },
            recipient: { id: 'parent-1', name: 'Jane Doe', email: 'parent@example.com', type: 'parent' },
            isReadByAdmin: true,
            isReadByParent: false,
            createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
            threadId: 'thread-1',
        },
        {
            id: 'msg_2',
            type: 'contact',
            subject: 'Question about school trip',
            body: 'When is the payment due?',
            sender: { id: 'parent-2', name: 'John Smith', email: 'john@example.com', type: 'parent' },
            recipient: { id: 'admin-1', name: 'Admin', email: 'admin@example.com', type: 'admin' },
            isReadByAdmin: true,
            isReadByParent: true,
            createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
            threadId: 'thread-2',
        },
    ];
    
    // Initialize documents
    mockDocumentsStore = [
        {
            id: 'doc_1',
            name: 'School Handbook 2024',
            url: '/documents/handbook-2024.pdf',
            type: 'pdf',
            category: 'General',
            uploadedAt: new Date().toISOString(),
            uploadedBy: 'Admin'
        },
        {
            id: 'doc_2',
            name: 'Term Dates',
            url: '/documents/term-dates.pdf',
            type: 'pdf',
            category: 'Calendar',
            uploadedAt: new Date().toISOString(),
            uploadedBy: 'Admin'
        }
    ];
    
    // Initialize photos
    mockPhotosStore = [
        {
            id: 'photo_1',
            imageUrl: '/images/school-event-1.jpg',
            caption: 'Sports Day 2024',
            yearGroups: ['All'],
            uploadedAt: new Date().toISOString(),
            uploadedBy: 'Teacher'
        }
    ];
    
    // Initialize notifications
    mockNotificationsStore = [
        { id: 'notif-1', parentId: 'parent-1', childId: 'child_1', childName: 'Charlie K.', teacherId: 'mock-teacher-id-1', teacherName: 'David Williams', type: 'Achievement', notes: 'Received a values certificate for kindness!', date: new Date(Date.now() - 86400000 * 1).toISOString(), isRead: false },
        { id: 'notif-2', parentId: 'parent-1', childId: 'child_1', childName: 'Charlie K.', teacherId: 'mock-teacher-id-1', teacherName: 'David Williams', type: 'Incident', notes: 'Bumped head in the playground.', treatmentGiven: 'Cold compress applied.', date: new Date(Date.now() - 86400000 * 3).toISOString(), isRead: true },
        // Charlie K. (Year 2) has 3 awards
        { id: 'notif-3', parentId: 'parent-1', childId: 'child_1', childName: 'Charlie K.', teacherId: 'mock-teacher-id-1', teacherName: 'Ms. Hughes', type: 'Values Award', notes: 'Values award for being helpful!', date: new Date(Date.now() - 86400000 * 7).toISOString(), isRead: true },
        { id: 'notif-5', parentId: 'parent-1', childId: 'child_1', childName: 'Charlie K.', teacherId: 'mock-teacher-id-1', teacherName: 'Mr. Evans', type: 'Values Award', notes: 'Values award for great listening!', date: new Date(Date.now() - 86400000 * 14).toISOString(), isRead: true },
        { id: 'notif-6', parentId: 'parent-1', childId: 'child_1', childName: 'Charlie K.', teacherId: 'mock-teacher-id-1', teacherName: 'Mr. Evans', type: 'Values Award', notes: 'Values award for excellent teamwork!', date: new Date(Date.now() - 86400000 * 21).toISOString(), isRead: true },
        // Sophie K. (Year 5) has 2 awards
        { id: 'notif-4', parentId: 'parent-1', childId: 'child_2', childName: 'Sophie K.', teacherId: 'mock-teacher-id-1', teacherName: 'Ms. Hughes', type: 'Values Award', notes: 'Values award for great teamwork!', date: new Date(Date.now() - 86400000 * 8).toISOString(), isRead: true },
        { id: 'notif-7', parentId: 'parent-1', childId: 'child_2', childName: 'Sophie K.', teacherId: 'mock-teacher-id-1', teacherName: 'Ms. Hughes', type: 'Values Award', notes: 'Values award for trying her best!', date: new Date(Date.now() - 86400000 * 30).toISOString(), isRead: true },
        // Year 6 students awards for Teacher Dashboard
        { id: 'notif-8', parentId: 'mock_parent_8', childId: 'mock_child_8', childName: 'Elin Evans', teacherId: 'mock-teacher-id-1', teacherName: 'David Williams', type: 'Values Award', notes: 'Award for being a kind friend.', date: new Date(Date.now() - 86400000 * 4).toISOString(), isRead: true },
        { id: 'notif-9', parentId: 'mock_parent_16', childId: 'mock_child_16', childName: 'Ava Davis', teacherId: 'mock-teacher-id-1', teacherName: 'David Williams', type: 'Values Award', notes: 'Award for excellent focus in class.', date: new Date(Date.now() - 86400000 * 5).toISOString(), isRead: true },
        { id: 'notif-10', parentId: 'mock_parent_16', childId: 'mock_child_16', childName: 'Ava Davis', teacherId: 'mock-teacher-id-1', teacherName: 'David Williams', type: 'Values Award', notes: 'Award for a brilliant science project.', date: new Date(Date.now() - 86400000 * 20).toISOString(), isRead: true },
        { id: 'notif-11', parentId: 'mock_parent_20', childId: 'mock_child_24', childName: 'Mia Rodriguez', teacherId: 'mock-teacher-id-1', teacherName: 'David Williams', type: 'Values Award', notes: 'Award for always trying her best.', date: new Date(Date.now() - 86400000 * 6).toISOString(), isRead: true },
    ];
    
    storesInitialized = true;
    console.log('Mock data stores initialized successfully');
};

// === NEWS ===
export type NewsPostWithId = NewsPost & { id: string };

export const getNews = async (): Promise<NewsPostWithId[]> => {
    initializeStores();
    const news = [...mockNewsStore];
    // Return all news for browsing; homepage applies lifecycle filtering
    return Promise.resolve(news);
};

export const addNews = async (newsData: Omit<NewsPost, 'id' | 'attachments' | 'slug'>): Promise<string> => {
    initializeStores();
    
    // If this news is urgent, remove urgent flag from all other news
    if (newsData.isUrgent) {
        mockNewsStore.forEach(post => {
            if (post.isUrgent) {
                post.isUrgent = false;
            }
        });
    }
    
    const newId = `mock_news_${Date.now()}`;
    const newPost: NewsPostWithId = {
        ...newsData,
        id: newId,
        slug: newsData.title_en.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        attachments: [],
        published: true,
        createdBy: 'Mock User',
        lastEdited: new Date().toISOString(),
    };
    mockNewsStore.push(newPost);
    console.log("Mock addNews:", newsData, 'Added successfully');
    return Promise.resolve(newId);
};

export const updateNews = async (id: string, newsData: Partial<Omit<NewsPost, 'id' | 'attachments'>>) => {
    initializeStores();
    
    // If this news is being marked as urgent, remove urgent flag from all other news
    if (newsData.isUrgent) {
        mockNewsStore.forEach(post => {
            if (post.id !== id && post.isUrgent) {
                post.isUrgent = false;
            }
        });
    }
    
    const index = mockNewsStore.findIndex(post => post.id === id);
    if (index !== -1) {
        mockNewsStore[index] = { ...mockNewsStore[index], ...newsData, lastEdited: new Date().toISOString() };
        console.log(`Mock updateNews (id: ${id}):`, newsData, 'Updated successfully');
    }
    return Promise.resolve();
};

export const deleteNews = async (id: string) => {
    initializeStores();
    const index = mockNewsStore.findIndex(post => post.id === id);
    if (index !== -1) {
        mockNewsStore.splice(index, 1);
        console.log(`Mock deleteNews (id: ${id}) - Deleted successfully`);
    }
    return Promise.resolve();
};

export const getPaginatedNews = async (limitNum = 20, lastDoc?: any): Promise<{ data: NewsPostWithId[], lastDoc?: any }> => {
    initializeStores();
    console.log('Using mock getPaginatedNews');
    const page = lastDoc ? lastDoc.page + 1 : 0;
    const start = page * limitNum;
    const end = start + limitNum;
    const data = mockNewsStore.slice(start, end);
    const nextLastDoc = end < mockNewsStore.length ? { page } : undefined;
    return Promise.resolve({ data, lastDoc: nextLastDoc });
};

// === CALENDAR ===
export type CalendarEventWithId = CalendarEvent & { id: string };

export const getCalendarEvents = async (): Promise<CalendarEventWithId[]> => {
    initializeStores();
    const events = [...mockCalendarStore];
    // Return all events for browsing; homepage applies lifecycle filtering
    return Promise.resolve(events);
};

export const addCalendarEvent = async (eventData: Omit<CalendarEvent, 'id' | 'attachments'>, crossPost: boolean) => {
    initializeStores();
    const newId = `mock_cal_${Date.now()}`;
    const newEvent: CalendarEventWithId = {
        ...eventData,
        id: newId,
        attachments: [],
    };
    
    if (crossPost) {
        // Simulate creating news post with bidirectional link
        const newsId = `mock_news_${Date.now()}`;
        newEvent.linkedNewsPostId = newsId;
        console.log(`Mock: Created bidirectional link - Calendar Event ${newId} <-> News Post ${newsId}`);
        console.log(`Mock: News post would contain linkedCalendarEventId: ${newId}`);
    }
    
    mockCalendarStore.push(newEvent);
    console.log("Mock addCalendarEvent:", eventData, `Cross-post: ${crossPost}`, 'Added successfully');
    return Promise.resolve();
};

export const updateCalendarEvent = async (id: string, eventData: Partial<Omit<CalendarEvent, 'id' | 'attachments'>>, crossPost: boolean) => {
    initializeStores();
    const index = mockCalendarStore.findIndex(event => event.id === id);
    if (index !== -1) {
        const existingEvent = mockCalendarStore[index];
        const updatedEvent = { ...existingEvent, ...eventData };
        
        if (crossPost) {
            if (existingEvent.linkedNewsPostId) {
                // Update existing linked news post
                console.log(`Mock: Updating linked news post ${existingEvent.linkedNewsPostId} with new event data`);
                console.log(`Mock: News post would maintain linkedCalendarEventId: ${id}`);
            } else {
                // Create new news post with bidirectional link
                const newsId = `mock_news_${Date.now()}`;
                updatedEvent.linkedNewsPostId = newsId;
                console.log(`Mock: Created new bidirectional link - Calendar Event ${id} <-> News Post ${newsId}`);
                console.log(`Mock: News post would contain linkedCalendarEventId: ${id}`);
            }
        }
        
        mockCalendarStore[index] = updatedEvent;
        console.log(`Mock updateCalendarEvent (id: ${id}):`, eventData, `Cross-post: ${crossPost}`, 'Updated successfully');
    }
    return Promise.resolve();
};

export const deleteCalendarEvent = async (id: string) => {
    initializeStores();
    const index = mockCalendarStore.findIndex(event => event.id === id);
    if (index !== -1) {
        mockCalendarStore.splice(index, 1);
        console.log(`Mock deleteCalendarEvent (id: ${id}) - Deleted successfully`);
    }
    return Promise.resolve();
};

export const getPaginatedCalendarEvents = async (limitNum = 20, lastDoc?: any): Promise<{ data: CalendarEventWithId[], lastDoc?: any }> => {
    initializeStores();
    console.log('Using mock getPaginatedCalendarEvents');
    const page = lastDoc ? lastDoc.page + 1 : 0;
    const start = page * limitNum;
    const end = start + limitNum;
    const data = mockCalendarStore.slice(start, end);
    const nextLastDoc = end < mockCalendarStore.length ? { page } : undefined;
    return Promise.resolve({ data, lastDoc: nextLastDoc });
};

// === STAFF ===
export const getStaff = async (): Promise<StaffMemberWithId[]> => {
    initializeStores();
    return Promise.resolve([...mockStaffStore]);
}

export const addStaffMember = async (staffData: StaffMember): Promise<string> => {
    initializeStores();
    const newId = `staff_${Date.now()}`;
    const newStaff: StaffMemberWithId = {
        ...staffData,
        id: newId,
    };
    mockStaffStore.push(newStaff);
    console.log("Mock addStaffMember:", staffData, 'Added successfully');
    return Promise.resolve(newId);
};

export const updateStaffMember = async (id: string, staffData: Partial<StaffMember>) => {
    initializeStores();
    const index = mockStaffStore.findIndex(staff => staff.id === id);
    if (index !== -1) {
        mockStaffStore[index] = { ...mockStaffStore[index], ...staffData };
        console.log(`Mock updateStaffMember (id: ${id}):`, staffData, 'Updated successfully');
    }
    return Promise.resolve();
};

export const deleteStaffMember = async (id: string) => {
    initializeStores();
    const index = mockStaffStore.findIndex(staff => staff.id === id);
    if (index !== -1) {
        mockStaffStore.splice(index, 1);
        console.log(`Mock deleteStaffMember (id: ${id}) - Deleted successfully`);
    }
    return Promise.resolve();
};

export const getPaginatedStaff = async (limitNum = 20, lastDoc?: any): Promise<{ data: StaffMemberWithId[], lastDoc?: any }> => {
    initializeStores();
    console.log('Using mock getPaginatedStaff');
    const page = lastDoc ? lastDoc.page + 1 : 0;
    const start = page * limitNum;
    const end = start + limitNum;
    const data = mockStaffStore.slice(start, end);
    const nextLastDoc = end < mockStaffStore.length ? { page } : undefined;
    return Promise.resolve({ data, lastDoc: nextLastDoc });
};

export const getTeacherAndClass = async (userId: string): Promise<{ teacher: StaffMemberWithId, myClass: ChildWithId[] } | null> => {
    initializeStores();
    const teacher = mockStaffStore.find(s => s.userId === userId);
    if (!teacher) {
        return null;
    }
    const myClass = mockChildrenStore.filter(c => c.yearGroup === teacher.team);
    return Promise.resolve({ teacher, myClass });
}

// === DOCUMENTS ===
export const getDocuments = async (): Promise<DocumentWithId[]> => {
    initializeStores();
    return Promise.resolve([...mockDocumentsStore]);
};

export const addDocument = async (docData: Document): Promise<string> => {
    initializeStores();
    const newId = `doc_${Date.now()}`;
    const newDocument: DocumentWithId = {
        ...docData,
        id: newId,
    };
    mockDocumentsStore.push(newDocument);
    console.log("Mock addDocument:", docData, 'Added successfully');
    return Promise.resolve(newId);
};

export const updateDocument = async (id: string, docData: Partial<Document>) => {
    initializeStores();
    const index = mockDocumentsStore.findIndex(doc => doc.id === id);
    if (index !== -1) {
        mockDocumentsStore[index] = { ...mockDocumentsStore[index], ...docData };
        console.log(`Mock updateDocument (id: ${id}):`, docData, 'Updated successfully');
    }
    return Promise.resolve();
};

export const deleteDocument = async (id: string) => {
    initializeStores();
    const index = mockDocumentsStore.findIndex(doc => doc.id === id);
    if (index !== -1) {
        mockDocumentsStore.splice(index, 1);
        console.log(`Mock deleteDocument (id: ${id}) - Deleted successfully`);
    }
    return Promise.resolve();
};

export const getPaginatedDocuments = async (limitNum = 20, lastDoc?: any): Promise<{ data: DocumentWithId[], lastDoc?: any }> => {
    initializeStores();
    console.log('Using mock getPaginatedDocuments');
    const page = lastDoc ? lastDoc.page + 1 : 0;
    const start = page * limitNum;
    const end = start + limitNum;
    const data = mockDocumentsStore.slice(start, end);
    const nextLastDoc = end < mockDocumentsStore.length ? { page } : undefined;
    return Promise.resolve({ data, lastDoc: nextLastDoc });
};

// === PARENTS ===
export const getParents = async (): Promise<ParentWithId[]> => {
    initializeStores();
    return Promise.resolve([...mockParentsStore]);
};

export const addParent = async (parentData: Parent): Promise<string> => {
    initializeStores();
    const newId = `parent_${Date.now()}`;
    const newParent: ParentWithId = {
        ...parentData,
        id: newId,
    };
    mockParentsStore.push(newParent);
    console.log("Mock addParent:", parentData, 'Added successfully');
    return Promise.resolve(newId);
};

export const updateParent = async (id: string, parentData: Partial<Parent>) => {
    initializeStores();
    const index = mockParentsStore.findIndex(parent => parent.id === id);
    if (index !== -1) {
        mockParentsStore[index] = { ...mockParentsStore[index], ...parentData };
        console.log(`Mock updateParent (id: ${id}):`, parentData, 'Updated successfully');
    }
    return Promise.resolve();
};

export const deleteParent = async (id: string) => {
    initializeStores();
    const index = mockParentsStore.findIndex(parent => parent.id === id);
    if (index !== -1) {
        mockParentsStore.splice(index, 1);
        console.log(`Mock deleteParent (id: ${id}) - Deleted successfully`);
    }
    return Promise.resolve();
};

export const getPaginatedParents = async (limitNum = 20, lastDoc?: any): Promise<{ data: ParentWithId[], lastDoc?: any }> => {
    initializeStores();
    console.log('Using mock getPaginatedParents');
    const page = lastDoc ? lastDoc.page + 1 : 0;
    const start = page * limitNum;
    const end = start + limitNum;
    const data = mockParentsStore.slice(start, end);
    const nextLastDoc = end < mockParentsStore.length ? { page } : undefined;
    return Promise.resolve({ data, lastDoc: nextLastDoc });
};

// === CHILDREN ===
export const getChildren = async (): Promise<ChildWithId[]> => {
    initializeStores();
    return Promise.resolve([...mockChildrenStore]);
};

export const getChildrenByYearGroup = async (yearGroup: string): Promise<ChildWithId[]> => {
    initializeStores();
    return Promise.resolve(mockChildrenStore.filter(c => c.yearGroup === yearGroup));
};

export const addChild = async (childData: Child): Promise<string> => {
    initializeStores();
    const newId = `child_${Date.now()}`;
    const newChild: ChildWithId = {
        ...childData,
        id: newId,
    };
    mockChildrenStore.push(newChild);
    console.log("Mock addChild:", childData, 'Added successfully');
    return Promise.resolve(newId);
};

export const bulkAddChildren = async (childrenData: Child[]) => {
    initializeStores();
    childrenData.forEach(childData => {
        const newId = `child_${Date.now()}_${Math.random()}`;
        const newChild: ChildWithId = {
            ...childData,
            id: newId,
        };
        mockChildrenStore.push(newChild);
    });
    console.log("Mock bulkAddChildren:", childrenData.length, 'children added successfully');
    return Promise.resolve();
};

export const updateChild = async (id: string, childData: Partial<Child>) => {
    initializeStores();
    const index = mockChildrenStore.findIndex(child => child.id === id);
    if (index !== -1) {
        mockChildrenStore[index] = { ...mockChildrenStore[index], ...childData };
        console.log(`Mock updateChild (id: ${id}):`, childData, 'Updated successfully');
    }
    return Promise.resolve();
};

export const deleteChild = async (id: string) => {
    initializeStores();
    const index = mockChildrenStore.findIndex(child => child.id === id);
    if (index !== -1) {
        mockChildrenStore.splice(index, 1);
        console.log(`Mock deleteChild (id: ${id}) - Deleted successfully`);
    }
    return Promise.resolve();
};

export const promoteAllChildren = async (): Promise<void> => {
    initializeStores();
    console.log("Mock promoting all children...");
    const leaversYear = new Date().getFullYear() + 1;
    const archiveLabel = `Archived/Leavers ${leaversYear}`;

    mockChildrenStore.forEach(child => {
        const currentYearIndex = yearGroups.indexOf(child.yearGroup);
        if (child.yearGroup === yearGroups[yearGroups.length - 1]) {
            child.yearGroup = archiveLabel;
        } else if (currentYearIndex > -1) {
            child.yearGroup = yearGroups[currentYearIndex + 1];
        }
    });
    console.log("Mock children promoted.");

    return Promise.resolve();
};

export const bulkUpdateChildren = async (ids: string[], data: Partial<Child>) => {
    initializeStores();
    ids.forEach(id => {
        const index = mockChildrenStore.findIndex(child => child.id === id);
        if (index !== -1) {
            mockChildrenStore[index] = { ...mockChildrenStore[index], ...data };
        }
    });
    console.log("Mock bulkUpdateChildren:", ids.length, 'children updated successfully');
    return Promise.resolve();
};

export const getPaginatedChildren = async (limitNum = 20, lastDoc?: any): Promise<{ data: ChildWithId[], lastDoc?: any }> => {
    initializeStores();
    console.log('Using mock getPaginatedChildren');
    const page = lastDoc ? lastDoc.page + 1 : 0;
    const start = page * limitNum;
    const end = start + limitNum;
    const data = mockChildrenStore.slice(start, end);
    const nextLastDoc = end < mockChildrenStore.length ? { page } : undefined;
    return Promise.resolve({ data, lastDoc: nextLastDoc });
};

// === SITE SETTINGS ===
let mockSiteSettings: SiteSettings = {
    address: "Ysgol Maes Y Morfa,\nOlive St,\nLlanelli\nSA15 2AP",
    phone: "01554 772945",
    email: "admin@maesymorfa.cymru",
    facebookUrl: 'https://facebook.com',
    twitterUrl: 'https://twitter.com',
    instagramUrl: '',
    youtubeUrl: '',
};

export const getSiteSettings = async (): Promise<SiteSettings | null> => {
    return Promise.resolve({ ...mockSiteSettings });
};

export const updateSiteSettings = async (settings: SiteSettings) => {
    Object.assign(mockSiteSettings, settings);
    console.log("Mock updateSiteSettings:", settings, 'Updated successfully');
    return Promise.resolve();
};


// === MENUS ===
let mockDailyMenus: DailyMenu[] = [];
let mockWeeklyMenus: WeeklyMenu[] = [];

const initializeMenus = () => {
    if (mockDailyMenus.length === 0) {
        mockDailyMenus = [
            { id: '1', date: '2024-01-15', meals: { breakfast: 'Porridge with fruit', lunch: 'Chicken curry with rice', snack: 'Apple slices' } },
            { id: '2', date: '2024-01-16', meals: { breakfast: 'Toast with jam', lunch: 'Fish and chips', snack: 'Yogurt' } },
        ];
    }
    if (mockWeeklyMenus.length === 0) {
        mockWeeklyMenus = [
            { id: '1', weekStarting: '2024-01-15', meals: {
                monday: { breakfast: 'Porridge', lunch: 'Chicken curry', snack: 'Apple' },
                tuesday: { breakfast: 'Toast', lunch: 'Fish & chips', snack: 'Yogurt' },
                wednesday: { breakfast: 'Cereal', lunch: 'Pasta bolognese', snack: 'Banana' },
                thursday: { breakfast: 'Bagel', lunch: 'Roast dinner', snack: 'Crackers' },
                friday: { breakfast: 'Pancakes', lunch: 'Pizza', snack: 'Fruit pot' }
            }}
        ];
    }
};

export const getDailyMenus = async (): Promise<DailyMenu[]> => {
    initializeMenus();
    return Promise.resolve([...mockDailyMenus]);
};

export const getWeeklyMenus = async (): Promise<WeeklyMenu[]> => {
    initializeMenus();
    return Promise.resolve([...mockWeeklyMenus]);
};

export const addDailyMenu = async (menuData: DailyMenu): Promise<string> => {
    initializeMenus();
    const newId = `daily_menu_${Date.now()}`;
    const newMenu = { ...menuData, id: newId };
    mockDailyMenus.push(newMenu);
    console.log("Mock addDailyMenu:", menuData, 'Added successfully');
    return Promise.resolve(newId);
};

export const addWeeklyMenu = async (menuData: WeeklyMenu): Promise<string> => {
    initializeMenus();
    const newId = `weekly_menu_${Date.now()}`;
    const newMenu = { ...menuData, id: newId };
    mockWeeklyMenus.push(newMenu);
    console.log("Mock addWeeklyMenu:", menuData, 'Added successfully');
    return Promise.resolve(newId);
};

export const updateDailyMenu = async (id: string, menuData: Partial<DailyMenu>) => {
    initializeMenus();
    const index = mockDailyMenus.findIndex(menu => menu.id === id);
    if (index !== -1) {
        mockDailyMenus[index] = { ...mockDailyMenus[index], ...menuData };
        console.log(`Mock updateDailyMenu (id: ${id}):`, menuData, 'Updated successfully');
    }
    return Promise.resolve();
};

// Overloaded function supports both updating a specific weekly menu from the list (legacy mock)
// and updating the single weekly menu settings object used by the app.
export function updateWeeklyMenu(id: string, menuData: Partial<WeeklyMenu>): Promise<void>;
export function updateWeeklyMenu(menu: WeeklyMenu): Promise<void>;
export async function updateWeeklyMenu(arg1: string | WeeklyMenu, arg2?: Partial<WeeklyMenu>): Promise<void> {
    initializeMenus();
    if (typeof arg1 === 'string') {
        const id = arg1;
        const menuData = arg2 ?? {};
        const index = mockWeeklyMenus.findIndex(menu => menu.id === id);
        if (index !== -1) {
            mockWeeklyMenus[index] = { ...mockWeeklyMenus[index], ...menuData } as any;
            console.log(`Mock updateWeeklyMenu (id: ${id}):`, menuData, 'Updated successfully');
        }
        return;
    } else {
        const menu = arg1;
        mockWeeklyMenu = menu;
        // Persist to localStorage so changes survive refresh in mock mode
        try {
            if (typeof window !== 'undefined') {
                localStorage.setItem('mock_weekly_menu_settings', JSON.stringify(menu));
            }
        } catch (_) {
            // ignore storage errors in mock mode
        }
        console.log('Mock updateWeeklyMenu (settings):', menu, 'Updated successfully');
        return;
    }
}

export const deleteDailyMenu = async (id: string) => {
    initializeMenus();
    const index = mockDailyMenus.findIndex(menu => menu.id === id);
    if (index !== -1) {
        mockDailyMenus.splice(index, 1);
        console.log(`Mock deleteDailyMenu (id: ${id}) - Deleted successfully`);
    }
    return Promise.resolve();
};

export const deleteWeeklyMenu = async (id: string) => {
    initializeMenus();
    const index = mockWeeklyMenus.findIndex(menu => menu.id === id);
    if (index !== -1) {
        mockWeeklyMenus.splice(index, 1);
        console.log(`Mock deleteWeeklyMenu (id: ${id}) - Deleted successfully`);
    }
    return Promise.resolve();
};

// === LUNCH MENU SETTINGS ===
let mockWeeklyMenu: WeeklyMenu = {
    monday: { main: "Shepherd's Pie", alt: "Jacket Potato with Beans", dessert: "Apple Crumble" },
    tuesday: { main: "Chicken Curry", alt: "Vegetable Lasagne", dessert: "Fruit Salad" },
    wednesday: { main: "Roast Beef Dinner", alt: "Quorn Roast Dinner", dessert: "Chocolate Sponge" },
    thursday: { main: "Spaghetti Bolognese", alt: "Vegetable Stir Fry", dessert: "Yoghurt" },
    friday: { main: "Fish and Chips", alt: "Veggie Sausages", dessert: "Flapjack" },
};

// Initialize from localStorage if available (mock persistence)
try {
    if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('mock_weekly_menu_settings');
        if (raw) {
            const parsed = JSON.parse(raw) as WeeklyMenu;
            if (parsed) {
                mockWeeklyMenu = parsed;
            }
        }
    }
} catch (_) {
    // ignore storage errors in mock mode
}

export const getWeeklyMenu = async (): Promise<WeeklyMenu | null> => {
    // Always prefer stored value, fallback to in-memory default
    try {
        if (typeof window !== 'undefined') {
            const raw = localStorage.getItem('mock_weekly_menu_settings');
            if (raw) {
                return Promise.resolve(JSON.parse(raw) as WeeklyMenu);
            }
        }
    } catch (_) {
        // ignore parsing/storage errors and return in-memory default
    }
    return Promise.resolve(mockWeeklyMenu);
}


// === INBOX ===
export const addInboxMessage = async (messageData: Omit<InboxMessage, 'id'>): Promise<string> => {
    initializeStores();
    const newMessage: InboxMessageWithId = {
        ...messageData,
        id: `inbox_${Date.now()}`,
    } as InboxMessageWithId;
    mockInboxStore.push(newMessage);
    console.log("Mock addInboxMessage:", messageData, 'Added successfully');
    return Promise.resolve(newMessage.id);
};

export const getInboxMessages = async (): Promise<InboxMessageWithId[]> => {
    initializeStores();
    return Promise.resolve([...mockInboxStore]);
};

export const getInboxMessagesForUser = async (userId: string): Promise<InboxMessageWithId[]> => {
    initializeStores();
    return Promise.resolve(mockInboxStore.filter(m => m.recipient?.id === userId || m.sender?.id === userId));
};

export const updateInboxMessage = async (id: string, data: Partial<InboxMessage>) => {
    initializeStores();
    const index = mockInboxStore.findIndex(m => m.id === id);
    if (index > -1) {
        mockInboxStore[index] = { ...mockInboxStore[index], ...data };
        console.log(`Mock updateInboxMessage (id: ${id}):`, data, 'Updated successfully');
    }
    return Promise.resolve();
};

export const deleteInboxMessage = async (id: string) => {
    initializeStores();
    const index = mockInboxStore.findIndex(m => m.id === id);
    if (index !== -1) {
        mockInboxStore.splice(index, 1);
        console.log(`Mock deleteInboxMessage (id: ${id}) - Deleted successfully`);
    }
    return Promise.resolve();
};

export const getUnreadMessageCount = async (userId: string, userType: 'admin' | 'parent'): Promise<number> => {
    initializeStores();
    if (userType === 'admin') {
        return Promise.resolve(mockInboxStore.filter(m => !m.isReadByAdmin).length);
    } else {
        return Promise.resolve(mockInboxStore.filter(m => m.recipient?.id === userId && !m.isReadByParent).length);
    }
};

// === NOTIFICATIONS ===
export const addParentNotification = async (notificationData: ParentNotification): Promise<string> => {
    initializeStores();
    const newNotif = { ...notificationData, id: `notif_${Date.now()}`};
    mockNotificationsStore.push(newNotif);
    console.log("Mock addParentNotification:", notificationData, 'Added successfully');
    return Promise.resolve(newNotif.id);
};

export const getParentNotifications = async (): Promise<ParentNotificationWithId[]> => {
    initializeStores();
    return Promise.resolve([...mockNotificationsStore]);
};

export const getNotificationsForParent = async (parentId: string): Promise<ParentNotificationWithId[]> => {
    initializeStores();
    return Promise.resolve(mockNotificationsStore.filter(n => n.parentId === parentId));
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    initializeStores();
    const index = mockNotificationsStore.findIndex(n => n.id === notificationId);
    if(index > -1) {
        mockNotificationsStore[index].isRead = true;
        console.log(`Mock markNotificationAsRead (id: ${notificationId}) - Marked as read`);
    }
    return Promise.resolve();
};

export const getValuesAwardCount = async (childId: string): Promise<number> => {
    initializeStores();
    return Promise.resolve(mockNotificationsStore.filter(n => n.childId === childId && n.type === 'Values Award').length);
};

export const getAwardsForChild = async (childId: string): Promise<ParentNotificationWithId[]> => {
    initializeStores();
    return Promise.resolve(mockNotificationsStore.filter(n => n.childId === childId && n.type === 'Values Award'));
};


// === GALLERY ===
export const addPhoto = async (photoData: Photo): Promise<string> => {
    initializeStores();
    const newId = `photo_${Date.now()}`;
    const newPhoto: PhotoWithId = {
        ...photoData,
        id: newId,
    };
    mockPhotosStore.push(newPhoto);
    console.log("Mock addPhoto:", photoData, 'Added successfully');
    return Promise.resolve(newId);
};

export const deletePhoto = async (id: string) => {
    initializeStores();
    const index = mockPhotosStore.findIndex(photo => photo.id === id);
    if (index !== -1) {
        mockPhotosStore.splice(index, 1);
        console.log(`Mock deletePhoto (id: ${id}) - Deleted successfully`);
    }
    return Promise.resolve();
};

export const getPaginatedPhotos = async (limitNum = 20, lastDoc?: any): Promise<{ data: PhotoWithId[], lastDoc?: any }> => {
    initializeStores();
    console.log('Using mock getPaginatedPhotos');
    const page = lastDoc ? lastDoc.page + 1 : 0;
    const start = page * limitNum;
    const end = start + limitNum;
    const data = mockPhotosStore.slice(start, end);
    const nextLastDoc = end < mockPhotosStore.length ? { page } : undefined;
    return Promise.resolve({ data, lastDoc: nextLastDoc });
};

export const getPhotosForYearGroups = async (yearGroups: string[]): Promise<PhotoWithId[]> => {
    initializeStores();
    return Promise.resolve(mockPhotosStore.filter(p => p.yearGroups.includes('All') || p.yearGroups.some(yg => yearGroups.includes(yg))));
};

// === USER MANAGEMENT ===
// This is now a mutable, in-memory store to simulate role changes for demos.
let mockUsers: UserWithRole[] = [
    { id: 'mock-admin-id-1', email: 'main.admin@example.com', role: 'admin', created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: 'mock-teacher-id-1', email: 'teacher@example.com', role: 'teacher', created_at: new Date(Date.now() - 86400000 * 4).toISOString() },
    { id: 'mock-parent-id-1', email: 'parent.one@example.com', role: 'parent', created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: 'mock-parent-id-2', email: 'parent.two@example.com', role: 'parent', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
];
export const getUsersWithRoles = async (): Promise<UserWithRole[]> => Promise.resolve(mockUsers);
export const updateUserRole = async (userId: string, role: UserRole): Promise<void> => {
    console.log("Mock updateUserRole", userId, role);
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        mockUsers[userIndex].role = role;
    }
};

export const createUser = async(email: string, role: UserRole) => {
    console.log(`Mock: Creating user for ${email} with role ${role}`);
    const newUser = {
        id: `mock-user-${Date.now()}`,
        email: email,
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        role: role,
    };
    mockUsers.push({ id: newUser.id, email: newUser.email, role: role, created_at: newUser.created_at });
    return Promise.resolve({ user: newUser, data: { user: newUser } as any });
};


// === UTILITIES ===
export const getCollectionCount = async (collectionName: string): Promise<number> => {
    initializeStores();
    initializeMenus();
    switch (collectionName) {
        case 'children': return Promise.resolve(mockChildrenStore.length);
        case 'parents': return Promise.resolve(mockParentsStore.length);
        case 'documents': return Promise.resolve(mockDocumentsStore.length);
        case 'staff': return Promise.resolve(mockStaffStore.length);
        case 'photos': return Promise.resolve(mockPhotosStore.length);
        case 'notifications': return Promise.resolve(mockNotificationsStore.length);
        case 'news': return Promise.resolve(mockNewsStore.length);
        case 'calendar': return Promise.resolve(mockCalendarStore.length);
        case 'inbox': return Promise.resolve(mockInboxStore.length);
        case 'dailyMenus': return Promise.resolve(mockDailyMenus.length);
        case 'weeklyMenus': return Promise.resolve(mockWeeklyMenus.length);
        default: return Promise.resolve(0);
    }
}

// Admin archiving functions removed - only homepage filtering remains

// Admin archiving functions removed - only homepage filtering remains
