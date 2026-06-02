import { seedDatabase } from './seed';

console.log('Starting standalone database seed...');
console.log('Using URI:', process.env.MONGODB_URI ? 'Defined' : 'Undefined');

seedDatabase()
  .then((res) => {
    console.log('Database seeded successfully!', res);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
