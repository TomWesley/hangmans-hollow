// // This file is for admin use only - run this script separately to reset your database
// // Install firebase-admin first: npm install firebase-admin

// const admin = require('firebase-admin');

// // You'll need to download a service account key from Firebase console
// // Path: Project Settings > Service accounts > Generate new private key
// const serviceAccount = require('./fbkey.json');

// // Initialize the admin SDK
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: 'https://singularity-c216f.firebaseio.com'
// });

// const db = admin.firestore();

// // Function to clear all users from the database
// async function resetUsers() {
//   try {
//     const usersRef = db.collection('users');
//     const snapshot = await usersRef.get();
    
//     if (snapshot.empty) {
//       console.log('No users to delete. Database is already empty.');
//       return;
//     }
    
//     // Use batched writes for better performance
//     const batchSize = 500;
//     let batch = db.batch();
//     let count = 0;
    
//     snapshot.forEach(doc => {
//       batch.delete(doc.ref);
//       count++;
      
//       if (count >= batchSize) {
//         console.log(`Committing batch of ${count} deletions...`);
//         batch.commit();
//         batch = db.batch();
//         count = 0;
//       }
//     });
    
//     // Commit any remaining deletes
//     if (count > 0) {
//       console.log(`Committing final batch of ${count} deletions...`);
//       await batch.commit();
//     }
    
//     console.log('Database reset complete. All users have been removed.');
//   } catch (error) {
//     console.error('Error resetting database:', error);
//   }
// }

// // Run the reset
// resetUsers().then(() => {
//   console.log('Database reset process complete.');
//   process.exit(0);
// }).catch(error => {
//   console.error('Reset process failed:', error);
//   process.exit(1);
// });