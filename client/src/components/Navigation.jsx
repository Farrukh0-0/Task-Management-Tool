import { Link } from 'react-router-dom'

export default function Navigation({ auth, onLogout }) {
  return (
    <nav className="navigation">
      <div>
        <strong>Task Manager</strong>
      </div>
      <div className="nav-links">
        {auth ? (
          <>
            <Link className="nav-link" to="/tasks">
              Tasks
            </Link>
            <span>{auth.email}</span>
            <span style={{ color: '#2563eb', fontWeight: '700' }}>{auth.role}</span>
            <button className="nav-link-button" type="button" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="nav-link" to="/login">
              Login
            </Link>
            <Link className="nav-link" to="/register">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
