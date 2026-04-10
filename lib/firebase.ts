import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDFGBItKhRRoQBVxdsPUD9Tb1Nn8jj4U1o",
  authDomain: "macromate-e0bea.firebaseapp.com",
  projectId: "macromate-e0bea",
  storageBucket: "macromate-e0bea.firebasestorage.app",
  messagingSenderId: "76367509810",
  appId: "1:76367509810:web:b9a60d63700829c5177f2b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const saveUserProfile = async (uid: string, data: any): Promise<boolean> => {
  try {
    const userRef = doc(db, "users", uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      // Create new
      await setDoc(userRef, {
        ...data,
        createdAt: serverTimestamp(),
        preferences: {
          onboardingComplete: false,
          dietType: null,
          activityLevel: null,
          goal: null,
          metrics: {
            age: null, weight: null, height: null, gender: null
          }
        }
      });
    } else {
      // Update existing if needed (usually just lastLogin or similar)
      await setDoc(userRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
    }
    return true;
  } catch (e) {
    console.error("Error saving user profile: ", e);
    return false;
  }
};

export const getUserProfile = async (uid: string) => {
  try {
    const docSnap = await getDoc(doc(db, "users", uid));
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (e) {
    console.error("Error getting user profile: ", e);
  }
  return null;
};
