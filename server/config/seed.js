import Department from '../models/Department.js';
import Counter from '../models/Counter.js';

const initialDepartments = [
  { name: 'Scholarship Office', code: 'SCH' },
  { name: 'Accounts Office', code: 'ACC' },
  { name: 'Examination Cell', code: 'EXM' },
  { name: 'Library', code: 'LIB' },
  { name: 'Hostel Office', code: 'HST' },
  { name: 'IT & Tech Support', code: 'ITS' },
];

export const seedDatabase = async () => {
  try {
    for (const deptData of initialDepartments) {
      let dept = await Department.findOne({ name: deptData.name });
      if (!dept) {
        dept = await Department.create({
          name: deptData.name,
          code: deptData.code,
          isActive: true,
        });
        console.log(`Seeded department: ${dept.name}`);
      }

      const counterCount = await Counter.countDocuments({ department: dept._id });
      if (counterCount === 0) {
        const counterNames = ['Counter A', 'Counter B', 'Counter C'];
        for (const name of counterNames) {
          await Counter.create({
            department: dept._id,
            name,
            currentQueueCount: 0,
            isOpen: true,
          });
        }
        console.log(`Seeded counters for department: ${dept.name}`);
      }
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
