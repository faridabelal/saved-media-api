import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [mediaItems, setMediaItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [mediaType, setMediaType] = useState('Movie')
  const [editingId, setEditingId] = useState(null)

  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [actionError, setActionError] = useState('')

  const busy = saving || deletingId !== null

  useEffect(() => {
    const controller = new AbortController()

    async function loadMedia() {
      try {
        const response = await fetch('/api/media', {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Could not load your saved media.')
        }

        const data = await response.json()
        setMediaItems(data)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadMedia()

    return () => controller.abort()
  }, [])

  function resetForm() {
    setTitle('')
    setMediaType('Movie')
    setEditingId(null)
  }

  function startEditing(item) {
    setEditingId(item.id)
    setTitle(item.title)
    setMediaType(item.mediaType)
    setActionError('')
  }

  function cancelEditing() {
    resetForm()
    setActionError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (busy) return

    setActionError('')

    if (!title.trim()) {
      setActionError('Please enter a title.')
      return
    }

    setSaving(true)

    const isEditing = editingId !== null
    const url = isEditing
      ? `/api/media/${editingId}`
      : '/api/media'

    try {
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          mediaType,
        }),
      })

      if (!response.ok) {
        throw new Error('Could not save the item. Please try again.')
      }

      const savedItem = await response.json()

      setMediaItems((currentItems) =>
        isEditing
          ? currentItems.map((item) =>
              item.id === savedItem.id ? savedItem : item
            )
          : [...currentItems, savedItem]
      )

      resetForm()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item) {
    if (busy) return

    const confirmed = window.confirm(`Delete "${item.title}"?`)
    if (!confirmed) return

    setActionError('')
    setDeletingId(item.id)

    try {
      const response = await fetch(`/api/media/${item.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Could not delete the item. Please try again.')
      }

      setMediaItems((currentItems) =>
        currentItems.filter((media) => media.id !== item.id)
      )

      if (editingId === item.id) {
        resetForm()
      }
    } catch (err) {
      setActionError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main>
      <h1>My Media Library</h1>
      <p>Keep your movies, books, TV shows, and music in one place.</p>

      <form onSubmit={handleSubmit}>
        <fieldset disabled={busy || loading || Boolean(error)}>
          <legend>
            {editingId !== null ? 'Edit media' : 'Add media'}
          </legend>

          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="For example, Inception"
            required
          />

          <label htmlFor="mediaType">Media type</label>
          <select
            id="mediaType"
            value={mediaType}
            onChange={(event) => setMediaType(event.target.value)}
          >
            <option value="Movie">Movie</option>
            <option value="Book">Book</option>
            <option value="TV Show">TV Show</option>
            <option value="Song">Song</option>
          </select>

          <button type="submit">
            {saving
              ? 'Saving...'
              : editingId !== null
                ? 'Save changes'
                : 'Add media'}
          </button>

          {editingId !== null && (
            <button type="button" onClick={cancelEditing}>
              Cancel
            </button>
          )}
        </fieldset>
      </form>

      {actionError && <p role="alert">{actionError}</p>}
      {loading && <p>Loading your media...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && (
        mediaItems.length === 0 ? (
          <p>No saved media yet.</p>
        ) : (
          <ul>
            {mediaItems.map((item) => (
              <li key={item.id}>
                <span>
                  <strong>{item.title}</strong> — {item.mediaType}
                </span>

                <button
                  type="button"
                  onClick={() => startEditing(item)}
                  disabled={busy}
                  aria-label={`Edit ${item.title}`}
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  disabled={busy}
                  aria-label={`Delete ${item.title}`}
                >
                  {deletingId === item.id ? 'Deleting...' : 'Delete'}
                </button>
              </li>
            ))}
          </ul>
        )
      )}
    </main>
  )
}

export default App