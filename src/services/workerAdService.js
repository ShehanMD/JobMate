
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebase";

const workerAdsCollection = collection(db, "workerAds");

// ======================================
// DATE HELPER
// ======================================

const toDate = (value) => {
  if (!value) return null;

  const date =
    typeof value.toDate === "function"
      ? value.toDate()
      : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

// ======================================
// REMAINING DAYS
// ======================================

export const getRemainingDays = (approvedAt, expiresAt = null) => {
  const approvalDate = toDate(approvedAt);

  if (!approvalDate) return 0;

  const expiryDate =
    toDate(expiresAt) ||
    new Date(approvalDate.getTime() + 7 * 24 * 60 * 60 * 1000);

  return Math.max(
    0,
    Math.ceil(
      (expiryDate.getTime() - Date.now()) /
      (24 * 60 * 60 * 1000)
    )
  );
};

// ======================================
// EXPIRY CHECK
// ======================================

export const isWorkerAdExpired = (ad) => {
  return (
    ad.status === "Approved" &&
    getRemainingDays(ad.approvedAt, ad.expiresAt) <= 0
  );
};

// ======================================
// SORT
// ======================================

const sortByDate = (ads, field = "submittedAt") => {
  return [...ads].sort((a, b) => {
    const dateA = toDate(a[field])?.getTime() || 0;
    const dateB = toDate(b[field])?.getTime() || 0;

    return dateB - dateA;
  });
};

// ======================================
// WORKER: OWN ADS
// ======================================

export const subscribeToWorkerAds = (
  workerId,
  callback,
  onError
) => {
  const workerQuery = query(
    workerAdsCollection,
    where("workerId", "==", workerId)
  );

  return onSnapshot(
    workerQuery,
    (snapshot) => {
      const ads = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      callback(sortByDate(ads));
    },
    onError
  );
};

// ======================================
// ADMIN: ALL ADS
// ======================================

export const subscribeToAllWorkerAds = (callback, onError) => {
  return onSnapshot(
    workerAdsCollection,
    (snapshot) => {
      const ads = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      callback(sortByDate(ads));
    },
    onError
  );
};

// ======================================
// PUBLIC: APPROVED ADS
// ======================================

export const subscribeToApprovedWorkerAds = (
  callback,
  onError
) => {
  const approvedQuery = query(
    workerAdsCollection,
    where("status", "==", "Approved")
  );

  return onSnapshot(
    approvedQuery,
    (snapshot) => {
      const ads = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      callback(sortByDate(ads, "approvedAt"));
    },
    onError
  );
};

// ======================================
// WORKER: CREATE AD
// ======================================

export const createWorkerAd = async (formData) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("LOGIN_REQUIRED");
  }

  const userSnapshot = await getDoc(
    doc(db, "users", currentUser.uid)
  );

  if (!userSnapshot.exists()) {
    throw new Error("WORKER_PROFILE_NOT_FOUND");
  }

  const profile = userSnapshot.data();

  if (
    profile.role !== "worker" ||
    profile.status !== "Active"
  ) {
    throw new Error("WORKER_ACCOUNT_NOT_ACTIVE");
  }

  const newAd = {
    workerId: currentUser.uid,

    workerName: String(
      formData.workerName || profile.name || ""
    ).trim(),

    workerPhone: String(
      formData.workerPhone || profile.phone || ""
    ).trim(),

    title: String(formData.title || "").trim(),
    skill: formData.skill,
    district: formData.district,
    rate: String(formData.rate || "").trim(),
    description: String(formData.description || "").trim(),

    status: "Pending",
    isVerified: false,

    rejectionReason: "",
    views: 0,

    submittedAt: serverTimestamp(),
    approvedAt: null,
    expiresAt: null,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const result = await addDoc(
    workerAdsCollection,
    newAd
  );

  return result.id;
};

// ======================================
// WORKER: EDIT / RESUBMIT
// ======================================

export const updateWorkerAd = async (adId, formData) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("LOGIN_REQUIRED");
  }

  const adRef = doc(db, "workerAds", adId);
  const snapshot = await getDoc(adRef);

  if (
    !snapshot.exists() ||
    snapshot.data().workerId !== currentUser.uid
  ) {
    throw new Error("ADVERTISEMENT_NOT_FOUND");
  }

  const profileSnapshot = await getDoc(
    doc(db, "users", currentUser.uid)
  );

  if (
    !profileSnapshot.exists() ||
    profileSnapshot.data().status !== "Active"
  ) {
    throw new Error("WORKER_ACCOUNT_NOT_ACTIVE");
  }

  await updateDoc(adRef, {
    workerName: String(
      formData.workerName || profileSnapshot.data().name || ""
    ).trim(),

    workerPhone: String(
      formData.workerPhone || profileSnapshot.data().phone || ""
    ).trim(),

    title: String(formData.title || "").trim(),
    skill: formData.skill,
    district: formData.district,
    rate: String(formData.rate || "").trim(),
    description: String(formData.description || "").trim(),

    status: "Pending",
    rejectionReason: "",
    approvedAt: null,
    expiresAt: null,

    submittedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// ======================================
// DELETE AD
// ======================================

export const deleteWorkerAd = async (adId) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("LOGIN_REQUIRED");
  }

  const adRef = doc(db, "workerAds", adId);
  const snapshot = await getDoc(adRef);

  if (
    !snapshot.exists() ||
    snapshot.data().workerId !== currentUser.uid
  ) {
    throw new Error("ADVERTISEMENT_NOT_FOUND");
  }

  await deleteDoc(adRef);
};

// ======================================
// ADMIN: APPROVE AD
// ======================================

export const approveWorkerAd = async (adId, workerId) => {
  const workerSnapshot = await getDoc(
    doc(db, "users", workerId)
  );

  if (!workerSnapshot.exists()) {
    throw new Error("WORKER_PROFILE_NOT_FOUND");
  }

  const worker = workerSnapshot.data();

  if (
    worker.role !== "worker" ||
    worker.status !== "Active"
  ) {
    throw new Error("WORKER_ACCOUNT_NOT_ACTIVE");
  }

  const isVerified =
    String(worker.verificationStatus || "").toLowerCase() ===
    "verified";

  const expiryDate = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  );

  await updateDoc(
    doc(db, "workerAds", adId),
    {
      status: "Approved",
      isVerified,

      approvedAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiryDate),

      rejectionReason: "",
      updatedAt: serverTimestamp(),
    }
  );
};

// ======================================
// ADMIN: REJECT AD
// ======================================

export const rejectWorkerAd = async (adId, reason) => {
  await updateDoc(
    doc(db, "workerAds", adId),
    {
      status: "Rejected",

      rejectionReason: String(
        reason || "Please review your advertisement and try again."
      ),

      approvedAt: null,
      expiresAt: null,

      updatedAt: serverTimestamp(),
    }
  );
};

// ======================================
// ADMIN: DELETE AD
// ======================================

export const adminDeleteWorkerAd = async (adId) => {
  await deleteDoc(
    doc(db, "workerAds", adId)
  );
};
