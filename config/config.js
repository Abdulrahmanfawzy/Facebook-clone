import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyDxf4nx5sZJYx0-HrVWIv78mDtdQw86fKg",
  authDomain: "social-app-20eb7.firebaseapp.com",
  databaseURL: "https://social-app-20eb7-default-rtdb.firebaseio.com",
  projectId: "social-app-20eb7",
  storageBucket: "social-app-20eb7.appspot.com",
  messagingSenderId: "636205257107",
  appId: "1:636205257107:web:498d7a94c70c5213f75866",
  measurementId: "G-DYLF0Q5QQJ",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
