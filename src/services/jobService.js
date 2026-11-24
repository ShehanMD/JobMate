
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebase";

const jobsCollection = collection(db, "jobs");

// Sri Lanka date in YYYY-MM-DD format
export const getTodayColomboDate = () => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Colombo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const values = Object.fromEntries(
        parts.map((part) => [part.type, part.value])
    );

    return `${values.year}-${values.month}-${values.day}`;
};

// Check whether a job deadline has passed
export const isJobExpired = (job) => {
    return Boolean(job.deadline) &&
        job.deadline < getTodayColomboDate();
};

// Get the status that should be displayed
export const getJobDisplayStatus = (job) => {
    if (job.status === "Active" && isJobExpired(job)) {
        return "Expired";
    }

    return job.status || "Draft";
};

// Sort jobs by creation date
const sortJobs = (jobs) => {
    return [...jobs].sort((a, b) => {
        const dateA = a.createdAt?.toMillis
            ? a.createdAt.toMillis()
            : new Date(a.createdAt || 0).getTime();

        const dateB = b.createdAt?.toMillis
            ? b.createdAt.toMillis()
            : new Date(b.createdAt || 0).getTime();

        return dateB - dateA;
    });
};

// Create a new job
export const createJob = async (formData, status) => {
    const newJob = {
        title: formData.title.trim(),
        company: formData.company.trim(),
        location: formData.location,
        type: formData.type,
        salary: formData.salary.trim(),
        category: formData.category,
        description: formData.description.trim(),
        requirements: formData.requirements.trim(),
        deadline: formData.deadline || null,

        status,

        createdBy: auth.currentUser?.uid || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(jobsCollection, newJob);

    return docRef.id;
};

// Update an existing job
export const updateJob = async (jobId, updatedData) => {
    const jobRef = doc(db, "jobs", jobId);

    await updateDoc(jobRef, {
        ...updatedData,
        updatedAt: serverTimestamp(),
    });
};

// Delete a job manually
export const deleteJob = async (jobId) => {
    const jobRef = doc(db, "jobs", jobId);
    await deleteDoc(jobRef);
};

// Listen to all jobs (Admin)
export const subscribeToAllJobs = (callback, onError) => {
    return onSnapshot(
        jobsCollection,
        (snapshot) => {
            const jobs = snapshot.docs.map((item) => ({
                id: item.id,
                ...item.data(),
            }));

            callback(sortJobs(jobs));
        },
        onError
    );
};

// Listen to active jobs (Public Website)
export const subscribeToPublicJobs = (callback, onError) => {
    const activeJobsQuery = query(
        jobsCollection,
        where("status", "==", "Active")
    );

    return onSnapshot(
        activeJobsQuery,
        (snapshot) => {
            const jobs = snapshot.docs.map((item) => ({
                id: item.id,
                ...item.data(),
            }));

            callback(sortJobs(jobs));
        },
        onError
    );
};

// Listen to a single job
export const subscribeToJob = (jobId, callback, onError) => {
    return onSnapshot(
        doc(db, "jobs", jobId),
        (snapshot) => {
            callback(
                snapshot.exists()
                    ? { id: snapshot.id, ...snapshot.data() }
                    : null
            );
        },
        onError
    );
};
