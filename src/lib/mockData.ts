
import type { ParentWithId, ChildWithId } from '@/lib/types';

const parentNames = [
    "Rhys Williams", "Ffion Davies", "Owain Evans", "Carys Jones", "Tomos Roberts", "Seren Thomas", 
    "Gethin Morgan", "Lowri Phillips", "Ieuan Hughes", "Nia Jenkins",
    "John Smith", "Emily Johnson", "Michael Brown", "Sarah Davis", "David Wilson", "Jennifer Martinez",
    "Chris Taylor", "Jessica Anderson", "Daniel Garcia", "Laura Rodriguez"
];

const childNames = [
    "Dylan", "Megan", "Evan", "Bethan", "Harri", "Mali", "Jac", "Elin", "Rhys", "Cadi",
    "Liam", "Olivia", "Noah", "Emma", "Oliver", "Ava", "Elijah", "Charlotte", "William", "Sophia",
    "James", "Amelia", "Benjamin", "Mia", "Lucas", "Harper", "Henry", "Evelyn", "Alexander", "Abigail",
    "Michael", "Emily", "Ethan", "Elizabeth", "Daniel", "Mila", "Matthew", "Ella", "Aiden", "Avery",
    "David", "Sofia", "Joseph", "Camila", "Samuel", "Aria", "Jackson", "Scarlett", "John", "Victoria",
    "Jonathan", "Madison", "Caleb", "Luna", "Joshua", "Grace", "Isaac", "Chloe", "Ryan", "Penelope"
];

function generateMockPhoneNumber(index: number) {
    const base = 7700900000;
    return `0${base + index}`;
}


export const generateMockData = () => {
    const mockParents: ParentWithId[] = [];
    for (let i = 0; i < parentNames.length; i++) {
        mockParents.push({
            id: `mock_parent_${i+1}`,
            name: parentNames[i],
            email: `${parentNames[i].toLowerCase().replace(' ', '.')}@example.com`,
            phone: generateMockPhoneNumber(i),
        });
    }

    const yearGroups = ['Nursery', 'Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'];
    const mockChildren: ChildWithId[] = [];
    for (let i = 0; i < childNames.length; i++) {
        const numParents = Math.random() > 0.3 ? 1 : 2; // 70% have 1 parent, 30% have 2
        const linkedParents: { parentId: string, relationship: string }[] = [];
        const availableParentIds = [...mockParents.map(p => p.id)];
        
        const relationships = ['Mother', 'Father', 'Guardian', 'Grandmother', 'Grandfather'];

        for (let j = 0; j < numParents; j++) {
            if (availableParentIds.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableParentIds.length);
                const parentId = availableParentIds.splice(randomIndex, 1)[0];
                linkedParents.push({
                    parentId: parentId,
                    relationship: relationships[j % relationships.length]
                });
            }
        }

        mockChildren.push({
            id: `mock_child_${i+1}`,
            name: `${childNames[i]} ${parentNames[i % parentNames.length].split(' ')[1]}`,
            yearGroup: yearGroups[i % yearGroups.length],
            linkedParents: linkedParents,
        });
    }
    
    return { mockParents, mockChildren };
};
