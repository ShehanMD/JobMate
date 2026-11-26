
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  onAuthStateChanged,
  signOut,
  getIdTokenResult,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
  increment,
  collection,
  writeBatch,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebase";

const AuthContext = createContext();

// ======================================
// CREATE USER PROFILE
// ======================================

const createUserProfile = async (user, role, name) => {
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {

    const profile = {
      uid: user.uid,
      name: name || user.displayName || "New User",

      email: user.email,
      photoURL: user.photoURL || "",

      role: role,

      phone: "",
      location: "",
      status: "Active",

      totalLogins: 0,
      lastActive: null,

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(userRef, profile);

  } else {

    // Fill missing fields for older accounts
    const existingData = snapshot.data();
    const updates = {};

    if (!("phone" in existingData)) {
      updates.phone = "";
    }

    if (!("location" in existingData)) {
      updates.location = "";
    }

    if (!("status" in existingData)) {
      updates.status = "Active";
    }

    if (!("totalLogins" in existingData)) {
      updates.totalLogins = 0;
    }

    if (!("lastActive" in existingData)) {
      updates.lastActive = null;
    }

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = serverTimestamp();
      await updateDoc(userRef, updates);
    }
  }

  const updatedSnapshot = await getDoc(userRef);

  return updatedSnapshot.data();
};

// ======================================
// RECORD LOGIN ACTIVITY
// ======================================

const recordUserLogin = async (user) => {
  try {
    const userRef = doc(db, "users", user.uid);

    const userSnapshot = await getDoc(userRef);

    // Skip tracking when a Firestore profile does not exist
    if (!userSnapshot.exists()) {
      console.warn("User profile not found. Login was not tracked.");
      return;
    }

    const batch = writeBatch(db);

    // Update login statistics
    batch.update(userRef, {
      totalLogins: increment(1),
      lastActive: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Create activity history record
    const activityRef = doc(
      collection(userRef, "activity")
    );

    batch.set(activityRef, {
      action: "Logged into the platform",
      createdAt: serverTimestamp(),
    });

    await batch.commit();

  } catch (error) {
    // Login should remain successful even if activity tracking fails
    console.error("Login activity tracking failed:", error);
  }
};

// ======================================
// AUTH PROVIDER
// ======================================

export function AuthProvider({ children }) {

  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Email Registration
  const register = async (name, email, password, role) => {

    const result = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const profile = await createUserProfile(
      result.user,
      role,
      name
    );

    setUserData(profile);

    return result.user;
  };

  // Email Login
  const login = async (email, password) => {

    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Track successful login
    await recordUserLogin(result.user);

    return result;
  };

  // Google / Facebook Registration
  const socialRegister = async (providerName, role) => {

    const provider =
      providerName === "google"
        ? new GoogleAuthProvider()
        : new FacebookAuthProvider();

    const result = await signInWithPopup(auth, provider);

    const profile = await createUserProfile(
      result.user,
      role
    );

    setUserData(profile);

    return result.user;
  };

  // Google / Facebook Login
  const socialLogin = async (providerName) => {

    const provider =
      providerName === "google"
        ? new GoogleAuthProvider()
        : new FacebookAuthProvider();

    const result = await signInWithPopup(auth, provider);

    const userRef = doc(db, "users", result.user.uid);
    const snapshot = await getDoc(userRef);

    // Only existing registered accounts can login
    if (!snapshot.exists()) {

      await signOut(auth);

      throw new Error("ACCOUNT_NOT_REGISTERED");
    }

    // Track successful login
    await recordUserLogin(result.user);

    return result.user;
  };

  // Logout
  const logout = () => signOut(auth);

  // Listen for authentication changes
  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {

        try {

          setCurrentUser(user);

          if (user) {

            const userRef = doc(db, "users", user.uid);
            const snapshot = await getDoc(userRef);

            if (snapshot.exists()) {
              setUserData(snapshot.data());
            } else {
              setUserData(null);
            }

            const token = await getIdTokenResult(user, true);

            setIsAdmin(token.claims.admin === true);

          } else {

            setUserData(null);
            setIsAdmin(false);

          }

        } catch (error) {

          console.error("Authentication error:", error);

          setUserData(null);
          setIsAdmin(false);

        } finally {

          setLoading(false);

        }
      }
    );

    return unsubscribe;

  }, []);

  const value = {
    currentUser,
    userData,
    isAdmin,
    loading,

    register,
    login,
    socialRegister,
    socialLogin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// ======================================
// CUSTOM AUTH HOOK
// ======================================

export function useAuth() {
  return useContext(AuthContext);
}
