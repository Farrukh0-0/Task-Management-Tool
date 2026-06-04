import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { createTask, updateTask, getUsers } from '../services/api'

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

export default function TaskCreation({ auth }) {
  const navigate = useNavigate()
  const location = useLocation()
  const editingTask = location.state?.task ?? null

  const [form, setForm] = useState(editingTask ? {
    title: editingTask.title || '',
    description: editingTask.description || '',
    dueDate: editingTask.dueDate ? editingTask.dueDate.slice(0, 10) : '',
    isComplete: editingTask.isComplete || false,
    priority: editingTask.priority || 'Medium',
    category: editingTask.category || '',
    ownerId: editingTask.ownerId || '',
  } : emptyForm)

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (auth.role === 'Admin') {
      getUsers().then(setUsers).catch((e) => setError(e.message))
    }
  }, [])

  const handleChange = (field) => (e) => {
    const value = field === 'isComplete' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

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

      if (editingTask) {
        await updateTask(editingTask.id, payload)
      } else {
        await createTask(payload)
      }

      navigate('/tasks')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-card">
      <h1 className="page-title">{editingTask ? 'Edit Task' : 'Create Task'}</h1>
      {error && <div className="alert">{error}</div>}
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field">
          <label>Title</label>
          <input value={form.title} onChange={handleChange('title')} required />
        </div>

        <div className="field">
          <label>Description</label>
          <textarea value={form.description} onChange={handleChange('description')} />
        </div>

        <div className="field">
          <label>Category</label>
          <input value={form.category} onChange={handleChange('category')} placeholder="e.g. Work" />
        </div>

        <div className="field">
          <label>Priority</label>
          <select value={form.priority} onChange={handleChange('priority')}>
            {priorities.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Due date</label>
          <input type="date" value={form.dueDate} onChange={handleChange('dueDate')} />
        </div>

        {auth.role === 'Admin' && (
          <div className="field">
            <label>Assign to user</label>
            <select value={form.ownerId} onChange={handleChange('ownerId')}>
              <option value="">Select user</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.email}</option>
              ))}
            </select>
          </div>
        )}

        <div className="field checkbox-field">
          <label>
            <input type="checkbox" checked={form.isComplete} onChange={handleChange('isComplete')} /> Completed
          </label>
        </div>

        <div className="button-row">
          <button type="submit" disabled={loading}>{loading ? 'Saving...' : (editingTask ? 'Save changes' : 'Create task')}</button>
          <button type="button" className="secondary" onClick={() => navigate('/tasks')}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
