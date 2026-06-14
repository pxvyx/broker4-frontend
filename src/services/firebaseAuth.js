import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
} from "firebase/auth";
import { auth, firebaseEnabled } from "./firebaseConfig";

export async function signInWithFirebaseEmail(email, password) {
  if (!firebaseEnabled || !auth) {
    throw new Error("Firebase chưa được cấu hình.");
  }

  await setPersistence(auth, browserLocalPersistence);
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await credential.user.getIdToken();
  localStorage.setItem("broker_firebase_token", idToken);
  return idToken;
}

export async function registerWithFirebaseEmail(email, password) {
  if (!firebaseEnabled || !auth) {
    throw new Error("Firebase chưa được cấu hình.");
  }

  await setPersistence(auth, browserLocalPersistence);
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const idToken = await credential.user.getIdToken();
  localStorage.setItem("broker_firebase_token", idToken);
  return idToken;
}

export async function logoutFirebase() {
  if (!firebaseEnabled || !auth) {
    return;
  }
  await signOut(auth);
}
