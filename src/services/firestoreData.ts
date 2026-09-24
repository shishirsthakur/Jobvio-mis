import {
  auth,
  db,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from '../firebase';
import { Candidate, Client } from '../types';
import { INITIAL_CANDIDATES } from '../data/initialCandidates';
import { INITIAL_CLIENTS } from '../data/clientsData';

const CANDIDATES_COLLECTION = 'candidates';
const CLIENTS_COLLECTION = 'clients';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): Error {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Error Context: ', JSON.stringify(errInfo));
  return new Error(JSON.stringify(errInfo));
}

// Seed initial candidates into Firestore if collection is empty
export async function seedInitialCandidatesIfEmpty(): Promise<boolean> {
  if (!auth.currentUser) return false;
  try {
    const candidatesCol = collection(db, CANDIDATES_COLLECTION);
    const snapshot = await getDocs(candidatesCol);
    if (snapshot.empty) {
      const batch = writeBatch(db);
      for (const cand of INITIAL_CANDIDATES) {
        const ref = doc(db, CANDIDATES_COLLECTION, cand.id);
        batch.set(ref, cand);
      }
      await batch.commit();
      return true;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, CANDIDATES_COLLECTION);
  }
  return false;
}

// Seed initial clients into Firestore if collection is empty
export async function seedInitialClientsIfEmpty(): Promise<boolean> {
  if (!auth.currentUser) return false;
  try {
    const clientsCol = collection(db, CLIENTS_COLLECTION);
    const snapshot = await getDocs(clientsCol);
    if (snapshot.empty) {
      const batch = writeBatch(db);
      for (const cl of INITIAL_CLIENTS) {
        const ref = doc(db, CLIENTS_COLLECTION, cl.id);
        batch.set(ref, cl);
      }
      await batch.commit();
      return true;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, CLIENTS_COLLECTION);
  }
  return false;
}

// Subscribe to real-time candidates updates from Firestore
export function subscribeToCandidates(
  callback: (candidates: Candidate[]) => void,
  onError?: (err: Error) => void
) {
  if (!auth.currentUser) {
    // Unauthenticated / local fallback mode
    return () => {};
  }
  const candidatesCol = collection(db, CANDIDATES_COLLECTION);
  return onSnapshot(
    candidatesCol,
    (snapshot) => {
      if (snapshot.empty) {
        // Trigger background seed
        seedInitialCandidatesIfEmpty().then((seeded) => {
          if (!seeded) {
            callback(INITIAL_CANDIDATES);
          }
        });
      } else {
        const list: Candidate[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Candidate);
        });
        callback(list);
      }
    },
    (err) => {
      const formattedErr = handleFirestoreError(err, OperationType.LIST, CANDIDATES_COLLECTION);
      if (onError) onError(formattedErr);
    }
  );
}

// Subscribe to real-time clients updates from Firestore
export function subscribeToClients(
  callback: (clients: Client[]) => void,
  onError?: (err: Error) => void
) {
  if (!auth.currentUser) {
    return () => {};
  }
  const clientsCol = collection(db, CLIENTS_COLLECTION);
  return onSnapshot(
    clientsCol,
    (snapshot) => {
      if (snapshot.empty) {
        // Trigger background seed
        seedInitialClientsIfEmpty().then((seeded) => {
          if (!seeded) {
            callback(INITIAL_CLIENTS);
          }
        });
      } else {
        const list: Client[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Client);
        });
        callback(list);
      }
    },
    (err) => {
      const formattedErr = handleFirestoreError(err, OperationType.LIST, CLIENTS_COLLECTION);
      if (onError) onError(formattedErr);
    }
  );
}

// Save or update a single candidate in Firestore
export async function saveCandidateToFirestore(candidate: Candidate): Promise<void> {
  if (!auth.currentUser) return;
  try {
    const ref = doc(db, CANDIDATES_COLLECTION, candidate.id);
    await setDoc(ref, candidate, { merge: true });
  } catch (err) {
    throw handleFirestoreError(err, OperationType.WRITE, `${CANDIDATES_COLLECTION}/${candidate.id}`);
  }
}

// Delete a candidate from Firestore
export async function deleteCandidateFromFirestore(candidateId: string): Promise<void> {
  if (!auth.currentUser) return;
  try {
    const ref = doc(db, CANDIDATES_COLLECTION, candidateId);
    await deleteDoc(ref);
  } catch (err) {
    throw handleFirestoreError(err, OperationType.DELETE, `${CANDIDATES_COLLECTION}/${candidateId}`);
  }
}

// Save or update a client in Firestore
export async function saveClientToFirestore(client: Client): Promise<void> {
  if (!auth.currentUser) return;
  try {
    const ref = doc(db, CLIENTS_COLLECTION, client.id);
    await setDoc(ref, client, { merge: true });
  } catch (err) {
    throw handleFirestoreError(err, OperationType.WRITE, `${CLIENTS_COLLECTION}/${client.id}`);
  }
}
