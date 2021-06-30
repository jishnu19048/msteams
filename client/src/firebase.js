import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyDtRevR0PRkjcORJ5DO8HQGPHlg1rKRAU8",
  authDomain: "engage-2021-796fc.firebaseapp.com",
  projectId: "engage-2021-796fc",
  storageBucket: "engage-2021-796fc.appspot.com",
  messagingSenderId: "225297056575",
  appId: "1:225297056575:web:61c8261b7b3fada8ec898a",
  measurementId: "G-8VKHQEB2ZZ"
};
  export const generateUserDocument = async (user, additionalData) => {
    if (!user) return;
    const userRef = firestore.doc(`users/${user.user.uid}`);
    const snapshot = await userRef.get();
    if (!snapshot.exists) {
      const email = user.user.email;
      const firstName = additionalData.firstName;
      console.log(email);
      try {
        await userRef.set({
          Email: email,
          Name: firstName
        });
      } catch (error) {
        console.error("Error creating user document", error);
      }
    }
    return getUserDocument(user.uid);
  };
  const getUserDocument = async uid => {
    if (!uid) return null;
    try {
      const userDocument = await firestore.doc(`users/${uid}`).get();
      return {
        uid,
        ...userDocument.data()
      };
    } catch (error) {
      console.error("Error fetching user", error);
    }
  };
  
firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const firestore = firebase.firestore();