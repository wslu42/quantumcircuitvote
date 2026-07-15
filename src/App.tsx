import { useEffect, useState } from 'react'
import { normalizeSessionId } from './firebase/sessionRepository'
import { AuthorPage } from './pages/AuthorPage'
import { HostPage } from './pages/HostPage'
import { StudentPage } from './pages/StudentPage'

type Route = 'author' | 'student' | 'host'
function routeFromHash(): Route { const value = location.hash.split('?')[0].replace('#/', ''); return value === 'author' || value === 'host' ? value : 'student' }
function sessionFromLocation(): string { const hashQuery = location.hash.split('?')[1] ?? ''; const value = new URLSearchParams(hashQuery || location.search).get('session') ?? 'DEMO'; try { return normalizeSessionId(value) } catch { return 'DEMO' } }

export default function App() {
  const [route, setRoute] = useState(routeFromHash)
  const [sessionId, setSessionId] = useState(sessionFromLocation)
  useEffect(() => { const update = () => { setRoute(routeFromHash()); setSessionId(sessionFromLocation()) }; addEventListener('hashchange', update); return () => removeEventListener('hashchange', update) }, [])
  const href = (target: Route) => `#/${target}?session=${encodeURIComponent(sessionId)}`
  return <><header className="site-header"><a className="brand" href={href('student')}><span className="brand-mark">Q</span><span>Quantum Circuit Classroom</span></a><nav><a className={route === 'student' ? 'active' : ''} href={href('student')}>Student</a><a className={route === 'author' ? 'active' : ''} href={href('author')}>Author</a><a className={route === 'host' ? 'active' : ''} href={href('host')}>Host</a></nav></header>{route === 'author' ? <AuthorPage sessionId={sessionId} /> : route === 'host' ? <HostPage sessionId={sessionId} /> : <StudentPage sessionId={sessionId} />}<footer>Quantum Circuit Classroom · Session {sessionId}</footer></>
}
