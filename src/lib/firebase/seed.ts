
import { addNews, addCalendarEvent, addStaffMember, addDocument, addParent, addChild } from './firestore';
import { news } from '../mockNews';
import { calendarEvents } from '../mockCalendar';
import { StaffMember, Document, Parent, Child } from '../types';

async function seedNews() {
  for (const n of news) {
    // Omit id, attachments, slug
    const { id, attachments, slug, ...rest } = n;
    await addNews(rest);
  }
  console.log('Seeded news');
}

async function seedCalendar() {
  for (const e of calendarEvents) {
    // Omit id, attachments
    const { id, attachments, ...rest } = e;
    await addCalendarEvent(rest, false);
  }
  console.log('Seeded calendar events');
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedStaff() {
  const teams = ['Teaching', 'Support', 'Admin'];
  for (let i = 1; i <= 25; i++) {
    const staff: StaffMember = {
      name: `Staff Member ${i}`,
      role: i % 3 === 0 ? 'Teaching Assistant' : 'Teacher',
      team: teams[i % teams.length],
      bio: `This is a short bio for staff member ${i}.`,
      photoUrl: undefined,
    };
    await addStaffMember(staff);
  }
  console.log('Seeded staff');
}

async function seedDocuments() {
  const categories = ['Policy', 'Form', 'Newsletter'];
  for (let i = 1; i <= 30; i++) {
    const doc: Document = {
      title: `Document ${i}`,
      category: categories[i % categories.length],
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      uploadedAt: new Date(Date.now() - i * 86400000).toISOString(),
    };
    await addDocument(doc);
  }
  console.log('Seeded documents');
}

async function seedParentsAndChildren() {
  const parentIds: string[] = [];
  // Seed 20 parents
  for (let i = 1; i <= 20; i++) {
    const parent: Parent = {
      name: `Parent ${i}`,
      email: `parent${i}@example.com`,
    };
    const id = await addParent(parent);
    parentIds.push(id);
  }
  // Seed 60 children, randomly assign to parents
  const yearGroups = [
    'Nursery', 'Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'
  ];
  for (let i = 1; i <= 60; i++) {
    const child: Child = {
      name: `Child ${i}`,
      yearGroup: yearGroups[i % yearGroups.length],
      linkedParents: [{ parentId: parentIds[randomInt(0, parentIds.length - 1)], relationship: 'Parent' }],
    };
    await addChild(child);
  }
  console.log('Seeded parents and children');
}

async function main() {
  await seedNews();
  await seedCalendar();
  await seedStaff();
  await seedDocuments();
  await seedParentsAndChildren();
  console.log('All data seeded!');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
