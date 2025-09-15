
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyClaBx4MVZdJbHG8kC-1XE4VZMjGczLTwA",
    authDomain: "psit-project-12199.firebaseapp.com",
    projectId: "psit-project-12199",
    storageBucket: "psit-project-12199.appspot.com",
    messagingSenderId: "124664563235",
    appId: "1:124664563235:web:c00c5c840ebd955c519396",
    measurementId: "G-JZCC85TWK4"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
//   console.log(analytics);


// To host your site with Firebase Hosting, you need the Firebase CLI (a command line tool).

// Run the following npm command to install the CLI or update to the latest CLI version.

// npm install -g firebase-tools