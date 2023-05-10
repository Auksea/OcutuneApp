import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDxfOiz23JaG5qAWMdn14_vPCv9BO9OqVc",
    authDomain: "authentication-4bfde.firebaseapp.com",
    projectId: "authentication-4bfde",
    storageBucket: "authentication-4bfde.appspot.com",
    messagingSenderId: "210740338502",
    appId: "1:210740338502:web:95b6dea03e47fda1ba0f47",
    measurementId: "G-GLBQMY9ELY"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth();

export { auth, signInWithEmailAndPassword };
export default app;
