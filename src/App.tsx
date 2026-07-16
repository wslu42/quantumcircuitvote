import { useEffect, useState } from 'react'
import { TeacherAuthGate } from './components/TeacherAuthGate'
import { normalizeSessionId } from './firebase/sessionRepository'
import { InstructorPage } from './pages/InstructorPage'
import { StudentPage } from './pages/StudentPage'

type Route = 'author' | 'student' | 'host'
function routeFromHash(): Route { const value = location.hash.split('?')[0].replace('#/', ''); return value === 'author' || value === 'host' ? value : 'student' }
function sessionFromLocation(): string { const hashQuery = location.hash.split('?')[1] ?? ''; const value = new URLSearchParams(hashQuery || location.search).get('session') ?? 'FOUNDATIONS'; try { return normalizeSessionId(value) } catch { return 'FOUNDATIONS' } }

export default function App() {
  const [route, setRoute] = useState(routeFromHash)
  const [sessionId, setSessionId] = useState(sessionFromLocation)
  useEffect(() => { const update = () => { setRoute(routeFromHash()); setSessionId(sessionFromLocation()) }; addEventListener('hashchange', update); return () => removeEventListener('hashchange', update) }, [])
  const href = (target: Route) => `#/${target}?session=${encodeURIComponent(sessionId)}`
  const page = route === 'student' ? <StudentPage sessionId={sessionId} /> : <InstructorPage sessionId={sessionId} />
  return <><header className="site-header"><a className="brand" href={href('student')}><span className="brand-mark">Q</span><span>Quantum Circuit Classroom</span></a><nav><a className={route === 'student' ? 'active' : ''} href={href('student')}>Student</a><a className={route !== 'student' ? 'active' : ''} href={href('author')}>Instructor</a></nav></header>{route === 'student' ? page : <TeacherAuthGate>{page}</TeacherAuthGate>}<footer>Quantum Circuit Classroom · Session {sessionId}</footer></>
}
