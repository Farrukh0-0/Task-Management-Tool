import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteTask, getTasks, getUsers, getUserProgress } from '../services/api'

export default function TaskDashboard({ auth }) {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [userProgress, setUserProgress] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('')
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const loadTasks = async () => {
    try {
      const result = await getTasks()
      setTasks(result)
      if (auth.role === 'Admin') {
        await loadUserProgress()
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const loadUsers = async () => {
    if (auth.role !== 'Admin') {
      return
    }

    try {
      const result = await getUsers()
      setUsers(result)
    } catch (err) {
      setError(err.message)
    }
  }

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
    loadTasks()
    loadUsers()
    loadUserProgress()
  }, [])


  const handleEdit = (task) => {
    // navigate to creation screen with task state to edit
    navigate('/create-task', { state: { task } })
  }

  const handleDelete = async (taskId) => {
    setError('')
    try {
      await deleteTask(taskId)
      await loadTasks()
      if (auth.role === 'Admin') {
        await loadUserProgress()
      }
    } catch (err) {
      setError(err.message)
    }
  }


  const displayedTasks = useMemo(() => {
    if (auth.role === 'Admin' && selectedUserId) {
      return tasks.filter((task) => task.ownerId === selectedUserId)
    }
    return tasks
  }, [tasks, auth.role, selectedUserId])

  const displayedUserProgress = useMemo(() => {
    if (auth.role === 'Admin' && selectedUserId) {
      return userProgress.filter((u) => u.id === selectedUserId)
    }
    return userProgress
  }, [userProgress, auth.role, selectedUserId])

  const summaryText = useMemo(() => {
    if (!displayedTasks.length) return 'No tasks yet. Add your first task.'
    return `Showing ${displayedTasks.length} task${displayedTasks.length === 1 ? '' : 's'}.`
  }, [displayedTasks])

  return (
    <div className="page-card">
      <div className="button-row" style={{ marginBottom: '20px', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Task management</h1>
          <div>
            {auth.role === 'Admin'
              ? 'Admin access enabled — you can assign tasks to any user.'
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
          <p>Track task progress for all users and filter tasks by assignee.</p>

          <div className="field">
            <label htmlFor="selectedUserId">Show tasks for user</label>
            <select id="selectedUserId" value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>
              <option value="">All users</option>
              {displayedUserProgress.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email}
                </option>
              ))}
            </select>
          </div>

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
              {displayedUserProgress.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.totalTasks}</td>
                  <td>{user.openTasks}</td>
                  <td>{user.completedTasks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Creation moved to separate screen */}

      <div style={{ marginTop: '32px' }}>
        <p>{summaryText}</p>
        <table className="task-list">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Assignee</th>
              <th>Due</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedTasks.map((task) => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{task.category || '-'}</td>
                <td>{task.priority}</td>
                <td>{task.ownerEmail || '-'}</td>
                <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                <td>{task.isComplete ? 'Complete' : 'Open'}</td>
                <td>
                  <button type="button" className="secondary" onClick={() => handleEdit(task)}>
                    Edit
                  </button>
                  <button type="button" className="danger" onClick={() => handleDelete(task.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
