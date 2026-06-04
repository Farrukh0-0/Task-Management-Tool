import { useEffect, useMemo, useState } from 'react'
import { createTask, deleteTask, getTasks, getUsers, updateTask } from '../services/api'

const emptyForm = {
  title: '',
  description: '',
  dueDate: '',
  isComplete: false,
  priority: 'Medium',
  category: '',
  ownerId: '',
}

const priorities = ['Low', 'Medium', 'High']

export default function TaskDashboard({ auth }) {
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const loadTasks = async () => {
    try {
      const result = await getTasks()
      setTasks(result)
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

  useEffect(() => {
    loadTasks()
    loadUsers()
  }, [])

  const handleChange = (field) => (event) => {
    const value = field === 'isComplete' ? event.target.checked : event.target.value
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        title: form.title,
        description: form.description,
        dueDate: form.dueDate || null,
        isComplete: form.isComplete,
        priority: form.priority,
        category: form.category || null,
        ownerId: auth.role === 'Admin' ? form.ownerId : undefined,
      }

      if (editingId) {
        await updateTask(editingId, payload)
      } else {
        await createTask(payload)
      }

      setForm(emptyForm)
      setEditingId(null)
      await loadTasks()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (task) => {
    setEditingId(task.id)
    setForm({
      title: task.title || '',
      description: task.description || '',
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      isComplete: task.isComplete,
      priority: task.priority || 'Medium',
      category: task.category || '',
      ownerId: task.ownerId || '',
    })
  }

  const handleDelete = async (taskId) => {
    setError('')
    try {
      await deleteTask(taskId)
      await loadTasks()
    } catch (err) {
      setError(err.message)
    }
  }

  const buttonLabel = editingId ? 'Save changes' : 'Add task'

  const summaryText = useMemo(() => {
    if (!tasks.length) return 'No tasks yet. Add your first task.'
    return `Showing ${tasks.length} task${tasks.length === 1 ? '' : 's'}.`
  }, [tasks])

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
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" value={form.title} onChange={handleChange('title')} required />
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea id="description" value={form.description} onChange={handleChange('description')} />
        </div>

        <div className="field">
          <label htmlFor="category">Category</label>
          <input id="category" value={form.category} onChange={handleChange('category')} placeholder="e.g. Work, Personal, Bug" />
        </div>

        <div className="field">
          <label htmlFor="priority">Priority</label>
          <select id="priority" value={form.priority} onChange={handleChange('priority')}>
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="dueDate">Due date</label>
          <input id="dueDate" type="date" value={form.dueDate} onChange={handleChange('dueDate')} />
        </div>

        {auth.role === 'Admin' && (
          <div className="field">
            <label htmlFor="ownerId">Assign to user</label>
            <select id="ownerId" value={form.ownerId} onChange={handleChange('ownerId')}>
              <option value="">Select user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="field checkbox-field">
          <label htmlFor="isComplete">
            <input id="isComplete" type="checkbox" checked={form.isComplete} onChange={handleChange('isComplete')} />
            {' '}Completed
          </label>
        </div>

        <div className="button-row">
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : buttonLabel}
          </button>
          {editingId && (
            <button type="button" className="secondary" onClick={() => { setForm(emptyForm); setEditingId(null) }}>
              Cancel
            </button>
          )}
        </div>
      </form>

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
            {tasks.map((task) => (
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
