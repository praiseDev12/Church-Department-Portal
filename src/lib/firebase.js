import { initializeApp } from 'firebase/app';

// Web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: 'AIzaSyCRjnfzWZP--r03Qm1McbpXcUp0V2jZntA',
//   authDomain: 'dominion-city-asaba-hq-portal.firebaseapp.com',
//   projectId: 'dominion-city-asaba-hq-portal',
//   storageBucket: 'dominion-city-asaba-hq-portal.firebasestorage.app',
//   messagingSenderId: '559550118696',
//   appId: '1:559550118696:web:c193ff880fc2f77d53ae1d',
// };

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
