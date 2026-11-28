
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

const usersCollection = collection(db, "users");

// ======================================
// GET ALL SKILLED WORKERS - REAL TIME
// ======================================

export const subscribeToWorkers = (callback, onError) => {
  const workersQuery = query(
    usersCollection,
    where("role", "==", "worker")
  );

  return onSnapshot(
    workersQuery,
    (snapshot) => {
      const workers = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      workers.sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || ""))
      );

      callback(workers);
    },
    onError
  );
};

// ======================================
// UPDATE WORKER PROFILE BY ADMIN
// ======================================

export const updateWorker = async (workerId, data) => {
  const allowedFields = [
    "name",
    "phone",
    "skill",
    "location",
    "status",
  ];

  const updates = {};

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  });

  if (Object.keys(updates).length === 0) {
    throw new Error("No worker details to update.");
  }

  updates.updatedAt = serverTimestamp();

  await updateDoc(
    doc(db, "users", workerId),
    updates
  );
};

// ======================================
// VERIFY / REJECT WORKER
// ======================================

export const updateWorkerVerification = async (
  workerId,
  verificationStatus
) => {
  if (!["Pending", "Verified", "Rejected"].includes(verificationStatus)) {
    throw new Error("Invalid verification status.");
  }

  await updateDoc(
    doc(db, "users", workerId),
    {
      verificationStatus,
      verifiedAt:
        verificationStatus === "Verified"
          ? serverTimestamp()
          : null,
      updatedAt: serverTimestamp(),
    }
  );
};

// ======================================
// DELETE WORKER PROFILE + THEIR POSTS
// ======================================

export const deleteWorkerProfile = async (workerId) => {
  const batch = writeBatch(db);

  // Delete this worker's service advertisements too.
  const adsQuery = query(
    collection(db, "workerAds"),
    where("workerId", "==", workerId)
  );

  const adsSnapshot = await getDocs(adsQuery);

  adsSnapshot.docs.forEach((item) => {
    batch.delete(item.ref);
  });

  // Delete the Firestore user profile.
  batch.delete(doc(db, "users", workerId));

  await batch.commit();
};
