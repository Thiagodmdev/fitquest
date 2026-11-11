import { initializeApp, type FirebaseOptions } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  type Firestore,
} from 'firebase/firestore';
import type { AppUser } from '../types';
import type { Api, Unsubscribe } from './api';

function toAppUser(user: User | null): AppUser | null {
  if (!user) return null;
  const email = user.email ?? '';
  return { uid: user.uid, email, name: user.displayName ?? email.split('@')[0] };
}

function watchCollection<T>(
  db: Firestore,
  path: string,
  onData: (items: T[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(db, path),
    (snapshot) => onData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as T)),
    onError,
  );
}

export function createFirebaseApi(config: FirebaseOptions): Api {
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const authListeners = new Set<(user: AppUser | null) => void>();

  return {
    mode: 'firebase',

    onAuthChange(callback) {
      authListeners.add(callback);
      const unsubscribe = onAuthStateChanged(auth, (user) => callback(toAppUser(user)));
      return () => {
        authListeners.delete(callback);
        unsubscribe();
      };
    },

    async login(email, password) {
      await signInWithEmailAndPassword(auth, email, password);
    },

    async register(name, email, password) {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: name });
      // O Firebase avisa do login antes de o nome ser salvo, então avisamos de novo com o nome.
      authListeners.forEach((listener) => listener(toAppUser(user)));
    },

    async logout() {
      await signOut(auth);
    },

    watchWorkouts(uid, onData, onError) {
      return watchCollection(db, `users/${uid}/workouts`, onData, onError);
    },

    async addWorkout(uid, workout) {
      await addDoc(collection(db, `users/${uid}/workouts`), workout);
    },

    async deleteWorkout(uid, id) {
      await deleteDoc(doc(db, `users/${uid}/workouts/${id}`));
    },

    watchRoutines(uid, onData, onError) {
      return watchCollection(db, `users/${uid}/routines`, onData, onError);
    },

    async addRoutine(uid, routine) {
      await addDoc(collection(db, `users/${uid}/routines`), routine);
    },

    async deleteRoutine(uid, id) {
      await deleteDoc(doc(db, `users/${uid}/routines/${id}`));
    },
  };
}
