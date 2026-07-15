import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyAZ_L6ru1tKWsB68pzwln-K7lB4xvMIpYE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'quantumcircuitvote-b4d42.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL ?? 'https://quantumcircuitvote-b4d42-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'quantumcircuitvote-b4d42',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'quantumcircuitvote-b4d42.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '886833352301',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:886833352301:web:8ffb9428151495dfaaf964',
}

export const app = getApps().length ? getApp() : initializeApp(config)
export const auth = getAuth(app)
export const database = getDatabase(app)
