
import {
  createContext,
  useContext,
  useEffect,
  useRef,
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
  deleteUser,
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

const AuthContext = createContext(null);


// ======================================
// CREATE USER PROFILE
// ======================================

const createUserProfile = async (
  user,
  role,
  name = "",
  phone = "",
  location = ""
) => {
  const userRef = doc(db, "users", user.uid);

  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const profile = {
      uid: user.uid,
      name: name || user.displayName || "New User",
      email: user.email || "",
      photoURL: user.photoURL || "",

      role: role === "worker" ? "worker" : "user",

      phone: phone || "",
      location: location || "",

      // New accounts are immediately active.
      status: "Active",

      totalLogins: 0,
      lastActive: null,

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(userRef, profile);

  } else {
    // Initialize missing fields in older accounts.

    const existingData = snapshot.data();

    const updates = {};

    if (!("phone" in existingData)) {
      updates.phone = phone || "";
    }

    if (!("location" in existingData)) {
      updates.location = location || "";
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

  return updatedSnapshot.exists()
    ? updatedSnapshot.data()
    : null;
};


// ======================================
// GET ACCOUNT DETAILS
// ======================================

const getAccountDetails = async (user) => {
  const token = await getIdTokenResult(user, true);

  const admin = token.claims.admin === true;

  const userRef = doc(db, "users", user.uid);

  const snapshot = await getDoc(userRef);

  const profile = snapshot.exists()
    ? snapshot.data()
    : null;

  // Admin accounts do not need a normal user profile.
  if (admin) {
    return {
      profile,
      isAdmin: true,
    };
  }

  // Normal accounts must have a Firestore profile.
  if (!profile) {
    throw new Error("ACCOUNT_PROFILE_NOT_FOUND");
  }

  // Inactive accounts cannot access the platform.
  if (
    String(profile.status || "Active").toLowerCase() === "inactive"
  ) {
    throw new Error("ACCOUNT_INACTIVE");
  }

  // New and legacy accounts can access the platform.
  return {
    profile,
    isAdmin: false,
  };
};


// ======================================
// RECORD USER LOGIN ACTIVITY
// ======================================

const recordUserLogin = async (user) => {
  try {
    const userRef = doc(db, "users", user.uid);

    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      return;
    }

    const batch = writeBatch(db);

    // Update login statistics.
    batch.update(userRef, {
      totalLogins: increment(1),
      lastActive: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Create activity record.
    const activityRef = doc(
      collection(userRef, "activity")
    );

    batch.set(activityRef, {
      action: "Logged into the platform",
      createdAt: serverTimestamp(),
    });

    await batch.commit();

  } catch (error) {
    // Login should not fail just because activity tracking fails.
    console.error(
      "Login activity tracking failed:",
      error
    );
  }
};


// ======================================
// DELETE INCOMPLETE ACCOUNT
// ======================================

const deleteCreatedAccount = async (user) => {
  await deleteUser(user);
};


// ======================================
// AUTH PROVIDER
// ======================================

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  const [userData, setUserData] = useState(null);

  const [isAdmin, setIsAdmin] = useState(false);

  const [loading, setLoading] = useState(true);

  // Avoid auth-state listener conflicts during auth actions.
  const authActionInProgress = useRef(false);


  const clearAuthState = () => {
    setCurrentUser(null);
    setUserData(null);
    setIsAdmin(false);
  };


  // ======================================
  // EMAIL REGISTRATION
  // ======================================

  const register = async (
    name,
    email,
    password,
    role,
    phone,
    location
  ) => {
    authActionInProgress.current = true;

    let createdUser = null;
    let profileCreated = false;

    try {
      // Create Firebase Authentication account.
      const result = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      createdUser = result.user;

      // Save profile information in Firestore.
      const profile = await createUserProfile(
        result.user,
        role,
        name,
        phone,
        location
      );

      if (!profile) {
        throw new Error("PROFILE_CREATION_FAILED");
      }

      profileCreated = true;

      // Keep the user logged in.
      setCurrentUser(result.user);
      setUserData(profile);
      setIsAdmin(false);

      return result.user;

    } catch (error) {
      // Remove incomplete Auth account if profile creation fails.
      if (
        createdUser &&
        !profileCreated &&
        auth.currentUser?.uid === createdUser.uid
      ) {
        try {
          await deleteCreatedAccount(createdUser);

        } catch (deleteError) {
          console.error(
            "Unable to remove incomplete account:",
            deleteError
          );

          if (auth.currentUser) {
            await signOut(auth);
          }
        }

      } else if (auth.currentUser) {
        await signOut(auth);
      }

      clearAuthState();

      throw error;

    } finally {
      authActionInProgress.current = false;
    }
  };


  // ======================================
  // EMAIL LOGIN
  // ======================================

  const login = async (email, password) => {
    authActionInProgress.current = true;

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const account = await getAccountDetails(result.user);

      if (!account.isAdmin) {
        await recordUserLogin(result.user);
      }

      setCurrentUser(result.user);
      setUserData(account.profile);
      setIsAdmin(account.isAdmin);

      return result.user;

    } catch (error) {
      if (auth.currentUser) {
        await signOut(auth);
      }

      clearAuthState();

      throw error;

    } finally {
      authActionInProgress.current = false;
    }
  };


  // ======================================
  // GOOGLE / FACEBOOK REGISTRATION
  // ======================================

  const socialRegister = async (providerName, role) => {
    let provider;

    if (providerName === "google") {
      provider = new GoogleAuthProvider();

    } else if (providerName === "facebook") {
      provider = new FacebookAuthProvider();

    } else {
      throw new Error("Unsupported registration provider.");
    }

    authActionInProgress.current = true;

    try {
      const result = await signInWithPopup(
        auth,
        provider
      );

      const userRef = doc(
        db,
        "users",
        result.user.uid
      );

      const snapshot = await getDoc(userRef);

      // Prevent duplicate registration.
      if (snapshot.exists()) {
        throw new Error("ACCOUNT_ALREADY_REGISTERED");
      }

      // Create profile automatically.
      const profile = await createUserProfile(
        result.user,
        role
      );

      if (!profile) {
        throw new Error("PROFILE_CREATION_FAILED");
      }

      // Keep the user logged in.
      setCurrentUser(result.user);
      setUserData(profile);
      setIsAdmin(false);

      return result.user;

    } catch (error) {
      if (auth.currentUser) {
        await signOut(auth);
      }

      clearAuthState();

      throw error;

    } finally {
      authActionInProgress.current = false;
    }
  };


  // ======================================
  // GOOGLE / FACEBOOK LOGIN
  // ======================================

  const socialLogin = async (providerName) => {
    let provider;

    if (providerName === "google") {
      provider = new GoogleAuthProvider();

    } else if (providerName === "facebook") {
      provider = new FacebookAuthProvider();

    } else {
      throw new Error("Unsupported login provider.");
    }

    authActionInProgress.current = true;

    try {
      const result = await signInWithPopup(
        auth,
        provider
      );

      const account = await getAccountDetails(
        result.user
      );

      if (!account.isAdmin) {
        await recordUserLogin(result.user);
      }

      setCurrentUser(result.user);
      setUserData(account.profile);
      setIsAdmin(account.isAdmin);

      return result.user;

    } catch (error) {
      if (auth.currentUser) {
        await signOut(auth);
      }

      clearAuthState();

      throw error;

    } finally {
      authActionInProgress.current = false;
    }
  };


  // ======================================
  // LOGOUT
  // ======================================

  const logout = async () => {
    authActionInProgress.current = true;

    try {
      await signOut(auth);

      clearAuthState();

    } finally {
      authActionInProgress.current = false;
    }
  };


  // ======================================
  // AUTHENTICATION STATE LISTENER
  // ======================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {

        // Another auth action is currently updating context.
        if (authActionInProgress.current) {
          setLoading(false);
          return;
        }

        try {
          if (!user) {
            clearAuthState();
            return;
          }

          const account = await getAccountDetails(user);

          setCurrentUser(user);
          setUserData(account.profile);
          setIsAdmin(account.isAdmin);

        } catch (error) {
          console.error(
            "Authentication state check failed:",
            error
          );

          authActionInProgress.current = true;

          try {
            if (auth.currentUser) {
              await signOut(auth);
            }
          } finally {
            authActionInProgress.current = false;
          }

          clearAuthState();

        } finally {
          setLoading(false);
        }
      }
    );

    return unsubscribe;
  }, []);


  // ======================================
  // CONTEXT VALUES
  // ======================================

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
