import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App instance
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with configured databaseId if present
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Configure Google Auth Provider with select_account prompt so
// the device's real accounts (phone, laptop, PC) and "Use another account" appear
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Test connection constraint as mandated by Firebase Skill
export async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

// Automatically test connection on boot
testConnection();

// Sync authenticated user profile to Firestore
export async function syncUserProfileToFirestore(user: FirebaseUser): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(
      userDocRef,
      {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Google User',
        photoURL: user.photoURL || '',
        lastLoginAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Note: Could not sync user profile to Firestore doc:', err);
  }
}

// Primary Sign In With Google function
export async function signInWithGoogle(): Promise<{
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
}> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  await syncUserProfileToFirestore(user);

  return {
    uid: user.uid,
    displayName: user.displayName || 'Google User',
    email: user.email || '',
    photoURL: user.photoURL || '',
  };
}

export { firebaseSignOut, onAuthStateChanged, sendPasswordResetEmail };
export type { FirebaseUser };
