import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { useEffect, useState, type ReactNode } from 'react'
import { auth } from '../firebase/client'
import './TeacherAuthGate.css'

const TEACHER_EMAIL = 'wslu42@gmail.com'

export function TeacherAuthGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(auth.currentUser)
  const [ready, setReady] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => onAuthStateChanged(auth, (nextUser) => {
    setUser(nextUser)
    setReady(true)
  }), [])

  const authorized = user?.email === TEACHER_EMAIL && user.emailVerified

  async function signIn() {
    setMessage('')
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ login_hint: TEACHER_EMAIL })
      await signInWithPopup(auth, provider)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Sign-in failed.')
    }
  }

  if (!ready) return <main className="single-column"><section className="panel empty"><p>Checking teacher access…</p></section></main>
  if (!authorized) return <main className="single-column"><section className="panel auth-panel"><span className="eyebrow">Teacher access</span><h1>Sign in to continue</h1><p className="lede">Authoring and host controls are restricted to {TEACHER_EMAIL}.</p>{user && <p className="notice warning">Signed in as {user.email ?? 'an unknown account'}, which is not authorized.</p>}<div className="actions"><button className="primary" onClick={signIn}>Sign in with Google</button>{user && <button className="secondary" onClick={() => signOut(auth)}>Sign out</button>}</div>{message && <p className="notice warning">{message}</p>}</section></main>

  return <><div className="teacher-session"><span>Signed in as {user.email}</span><button className="secondary" onClick={() => signOut(auth)}>Sign out</button></div>{children}</>
}
