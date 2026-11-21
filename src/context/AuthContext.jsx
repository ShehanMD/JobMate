
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
} from "firebase/firestore";

import { auth, db } from "../firebase/firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Create Firestore profile
 
const createUserProfile = async (user, role, name) => {
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const profile = {
      uid: user.uid,
      name: name || user.displayName || "New User",
      email: user.email,
      photoURL: user.photoURL || "",
      role,
      createdAt: serverTimestamp(),
    };

    await setDoc(userRef, profile);
    setUserData(profile);
  } else {
    setUserData(snapshot.data());
  }
};


  // Email registration
  const register = async (name, email, password, role) => {
    const result = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await createUserProfile(result.user, role, name);

    return result.user;
  };

  // Email login
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Google / Facebook registration
  const socialRegister = async (providerName, role) => {
    const provider =
      providerName === "google"
        ? new GoogleAuthProvider()
        : new FacebookAuthProvider();

    const result = await signInWithPopup(auth, provider);

    await createUserProfile(result.user, role);

    return result.user;
  };

  // Social login - existing accounts only
  const socialLogin = async (providerName) => {
    const provider =
      providerName === "google"
        ? new GoogleAuthProvider()
        : new FacebookAuthProvider();

    const result = await signInWithPopup(auth, provider);

    const userRef = doc(db, "users", result.user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      await signOut(auth);

      throw new Error(
        "ACCOUNT_NOT_REGISTERED"
      );
    }

    return result.user;
  };

  // Logout
  const logout = () => signOut(auth);

  // Listen for authentication changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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
    });

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

export function useAuth() {
  return useContext(AuthContext);
}
