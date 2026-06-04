import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTasks, deleteTask } from '../services/api'

export default function UserTaskDetail({ auth }) {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userName, setUserName] = useState('')

  useEffect(() => {
    loadUserTasks()
  }, [userId])

  const loadUserTasks = async () => {
    setLoading(true)
    setError('')
    try {
      const allTasks = await getTasks()
      const userTasks = allTasks.filter((t) => t.ownerId === userId)
      setTasks(userTasks)
      if (userTasks.length > 0) {
        setUserName(userTasks[0].ownerEmail || 'Unknown User')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (task) => {
    navigate('/create-task', { state: { task } })
  }

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    try {
      await deleteTask(taskId)
      await loadUserTasks()
    } catch (err) {
      setError(err.message)
    }
  }

  const completedCount = tasks.filter((t) => t.isComplete).length
  const openCount = tasks.filter((t) => !t.isComplete).length

  return (
    <div className="page-card">
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate('/tasks')} className="secondary">← Back to Dashboard</button>
      </div>

      <h1 className="page-title">Tasks for {userName}</h1>
      {error && <div className="alert">{error}</div>}

      <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '4px' }}>
        <p><strong>Total:</strong> {tasks.length} | <strong>Open:</strong> {openCount} | <strong>Completed:</strong> {completedCount}</p>
      </div>

      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks assigned to this user.</p>
      ) : (
        <table className="task-list">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td><strong>{task.title}</strong></td>
                <td>{task.description || '-'}</td>
                <td>{task.category || '-'}</td>
                <td>{task.priority}</td>
                <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                <td>{task.isComplete ? '✓ Completed' : 'Open'}</td>
                <td>
                  <button type="button" className="secondary" onClick={() => handleEdit(task)}>Edit</button>
                  <button type="button" className="danger" onClick={() => handleDelete(task.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
