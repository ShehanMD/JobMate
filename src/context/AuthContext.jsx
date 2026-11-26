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
  getAdditionalUserInfo,
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
// CREATE / UPDATE USER PROFILE
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

      // All new accounts require Admin approval.
      status: "Pending",

      totalLogins: 0,

      lastActive: null,

      createdAt: serverTimestamp(),

      updatedAt: serverTimestamp(),
    };

    await setDoc(userRef, profile);

  } else {
    // Initialize missing fields in older profiles.
    // Missing status is treated as Pending.

    const existingData = snapshot.data();

    const updates = {};

    if (!("phone" in existingData)) {
      updates.phone = phone || "";
    }

    if (!("location" in existingData)) {
      updates.location = location || "";
    }

    if (!("status" in existingData)) {
      updates.status = "Pending";
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
// CHECK ACCOUNT APPROVAL
// ======================================

const checkUserApproval = async (user) => {
  const token = await getIdTokenResult(user, true);

  const admin = token.claims.admin === true;

  const userRef = doc(db, "users", user.uid);

  const userSnapshot = await getDoc(userRef);

  const profile = userSnapshot.exists()
    ? userSnapshot.data()
    : null;

  // Admin accounts do not require normal user approval.
  if (admin) {
    return {
      profile,
      isAdmin: true,
    };
  }

  if (!profile) {
    throw new Error("ACCOUNT_PROFILE_NOT_FOUND");
  }

  const status = profile.status || "Pending";

  if (status === "Pending") {
    throw new Error("ACCOUNT_PENDING_APPROVAL");
  }

  if (status !== "Active") {
    throw new Error("ACCOUNT_INACTIVE");
  }

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

    // Admin accounts may not have a users document.
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

    // Create activity history record.
    const activityRef = doc(
      collection(userRef, "activity")
    );

    batch.set(activityRef, {
      action: "Logged into the platform",

      createdAt: serverTimestamp(),
    });

    await batch.commit();

  } catch (error) {
    // Activity tracking should not prevent an approved user from logging in.
    console.error(
      "Login activity tracking failed:",
      error
    );
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

  // Prevent auth-state listener conflicts during register/login/logout.
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

      // Save all registration details in Firestore.
      await createUserProfile(
        result.user,
        role,
        name,
        phone,
        location
      );

      profileCreated = true;

      // Sign out until an Admin approves the account.
      await signOut(auth);

      clearAuthState();

      return result.user;

    } catch (error) {
      // Roll back a newly created Auth account if Firestore
      // profile creation failed.

      if (
        createdUser &&
        !profileCreated &&
        auth.currentUser?.uid === createdUser.uid
      ) {
        try {
          await deleteUser(createdUser);

        } catch (deleteError) {
          console.error(
            "Unable to roll back the incomplete account:",
            deleteError
          );

          if (auth.currentUser) {
            await signOut(auth);
          }
        }

      } else if (auth.currentUser) {
        try {
          await signOut(auth);

        } catch (signOutError) {
          console.error(
            "Unable to sign out after registration error:",
            signOutError
          );
        }
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

      // Check account approval.
      const approval = await checkUserApproval(result.user);

      // Record login only for normal approved users.
      if (!approval.isAdmin) {
        await recordUserLogin(result.user);
      }

      // Get latest profile data.
      const latestSnapshot = await getDoc(
        doc(db, "users", result.user.uid)
      );

      const latestProfile = latestSnapshot.exists()
        ? latestSnapshot.data()
        : approval.profile;

      setCurrentUser(result.user);

      setUserData(latestProfile || null);

      setIsAdmin(approval.isAdmin);

      return result.user;

    } catch (error) {
      if (auth.currentUser) {
        try {
          await signOut(auth);

        } catch (signOutError) {
          console.error(
            "Unable to sign out after login error:",
            signOutError
          );
        }
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

    let socialUser = null;

    let socialUserIsNew = false;

    let socialProfileCreated = false;

    try {
      // Open Google / Facebook popup.
      const result = await signInWithPopup(auth, provider);

      socialUser = result.user;

      socialUserIsNew =
        getAdditionalUserInfo(result)?.isNewUser === true;

      const userRef = doc(db, "users", result.user.uid);

      const snapshot = await getDoc(userRef);

      // Prevent duplicate registration.
      if (snapshot.exists()) {
        throw new Error("ACCOUNT_ALREADY_REGISTERED");
      }

      // Create profile using social provider information.
      await createUserProfile(
        result.user,
        role
      );

      socialProfileCreated = true;

      // Sign out until Admin approval.
      await signOut(auth);

      clearAuthState();

      return result.user;

    } catch (error) {
      // Remove a new Auth account if its Firestore profile
      // could not be created.

      if (
        socialUser &&
        socialUserIsNew &&
        !socialProfileCreated &&
        auth.currentUser?.uid === socialUser.uid
      ) {
        try {
          await deleteUser(socialUser);

        } catch (deleteError) {
          console.error(
            "Unable to roll back the incomplete social account:",
            deleteError
          );

          if (auth.currentUser) {
            await signOut(auth);
          }
        }

      } else if (auth.currentUser) {
        try {
          await signOut(auth);

        } catch (signOutError) {
          console.error(
            "Unable to sign out after social registration error:",
            signOutError
          );
        }
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
      const result = await signInWithPopup(auth, provider);

      // Check approval before allowing access.
      const approval = await checkUserApproval(result.user);

      if (!approval.isAdmin) {
        await recordUserLogin(result.user);
      }

      const latestSnapshot = await getDoc(
        doc(db, "users", result.user.uid)
      );

      const latestProfile = latestSnapshot.exists()
        ? latestSnapshot.data()
        : approval.profile;

      setCurrentUser(result.user);

      setUserData(latestProfile || null);

      setIsAdmin(approval.isAdmin);

      return result.user;

    } catch (error) {
      if (auth.currentUser) {
        try {
          await signOut(auth);

        } catch (signOutError) {
          console.error(
            "Unable to sign out after social login error:",
            signOutError
          );
        }
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
        // The active auth action will update context state
        // after validating the account.
        if (authActionInProgress.current) {
          setLoading(false);
          return;
        }

        try {
          if (!user) {
            clearAuthState();
            return;
          }

          // Check Admin custom claim.
          const token = await getIdTokenResult(
            user,
            true
          );

          const admin = token.claims.admin === true;

          // Load Firestore profile.
          const userRef = doc(db, "users", user.uid);

          const snapshot = await getDoc(userRef);

          const profile = snapshot.exists()
            ? snapshot.data()
            : null;

          // Normal accounts must be approved.
          if (!admin) {
            const status = profile?.status || "Pending";

            if (!profile || status !== "Active") {
              authActionInProgress.current = true;

              try {
                await signOut(auth);

              } finally {
                authActionInProgress.current = false;
              }

              clearAuthState();

              return;
            }
          }

          setCurrentUser(user);

          setUserData(profile);

          setIsAdmin(admin);

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
  // AUTH CONTEXT VALUES
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