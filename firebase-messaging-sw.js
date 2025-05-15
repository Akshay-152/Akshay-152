// Import Firebase scripts for the service worker
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js');
// Initialize Firebase in the service worker using the same config as in index.html
firebase.initializeApp({
  apiKey: "AIzaSyBfDB2Ca3Sb1mHuPN50i4nRzHFL_dgzpRA",
  authDomain: "message-792de.firebaseapp.com",
  projectId: "message-792de",
  storageBucket: "message-792de.appspot.com",
  messagingSenderId: "346450288358",
  appId: "1:346450288358:web:101992db1ca1de3af3e527",
  measurementId: "G-W7Q8K6B202"
});
const messaging = firebase.messaging();
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title || 'Background Message Title';
  const notificationOptions = {
    body: payload.notification.body || 'Background Message body.',
    icon: payload.notification.icon || '/firebase-logo.png'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});