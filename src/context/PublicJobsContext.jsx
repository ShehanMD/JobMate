
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  subscribeToPublicJobs,
} from "../services/jobService";

const PublicJobsContext = createContext(null);

export function PublicJobsProvider({ children }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToPublicJobs(
      (fetchedJobs) => {
        setJobs(fetchedJobs);
        setLoading(false);
        setError("");
      },
      (err) => {
        console.error("Public jobs error:", err);
        setError("Unable to load jobs.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <PublicJobsContext.Provider
      value={{ jobs, loading, error }}
    >
      {children}
    </PublicJobsContext.Provider>
  );
}

export function usePublicJobs() {
  const context = useContext(PublicJobsContext);

  if (!context) {
    throw new Error(
      "usePublicJobs must be used inside PublicJobsProvider"
    );
  }

  return context;
}
