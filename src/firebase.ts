import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDFZedshvUE1liOZ_llQGa6sYJZL1O5msY",
  authDomain: "carbon-compass-fd19c.firebaseapp.com",
  projectId: "carbon-compass-fd19c",
  storageBucket: "carbon-compass-fd19c.firebasestorage.app",
  messagingSenderId: "659477210908",
  appId: "1:659477210908:web:7ace09036c0fb2caa53cd9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
