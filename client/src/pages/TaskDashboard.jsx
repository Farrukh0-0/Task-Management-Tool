import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserProgress } from '../services/api'

export default function TaskDashboard({ auth }) {
  const navigate = useNavigate()
  const [userProgress, setUserProgress] = useState([])
  const [error, setError] = useState('')

  const loadUserProgress = async () => {
    if (auth.role !== 'Admin') {
      return
    }

    try {
      const result = await getUserProgress()
      setUserProgress(result)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    loadUserProgress()
  }, [auth])

  return (
    <div className="page-card">
      <div className="button-row" style={{ marginBottom: '20px', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Task management</h1>
          <div>
            {auth.role === 'Admin'
              ? 'Admin access enabled — you can view all users and their task progress.'
              : 'Regular user access — you can create and manage your own tasks.'}
          </div>
        </div>
      </div>

      {error && <div className="alert">{error}</div>}

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate('/create-task')} className="primary">Create Task</button>
      </div>

      {auth.role === 'Admin' && userProgress.length > 0 && (
        <section className="admin-panel" style={{ marginBottom: '24px' }}>
          <h2>Admin monitoring</h2>
          <p>Click on any user to view their assigned tasks and details.</p>

          <table className="task-list">
            <thead>
              <tr>
                <th>User</th>
                <th>Total</th>
                <th>Open</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {userProgress.map((user) => (
                <tr 
                  key={user.id}
                  onClick={() => navigate(`/user/${user.id}/tasks`)}
                  style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td><strong>{user.email}</strong></td>
                  <td>{user.totalTasks}</td>
                  <td>{user.openTasks}</td>
                  <td>{user.completedTasks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}
