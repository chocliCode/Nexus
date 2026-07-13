import globalSetup from '../globalSetup';

globalSetup().then(() => {
  console.log('E2E Database seeded successfully!');
  process.exit(0);
}).catch(err => {
  console.error('Failed to seed E2E Database:', err);
  process.exit(1);
});
