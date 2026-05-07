'use client'

import { useState, useCallback, useRef } from 'react'
import useSWR, { mutate } from 'swr'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { MediaFile } from '@/app/api/media/list/route'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function MediaLibraryPage() {
  const { data, isLoading, error } = useSWR<{ files: MediaFile[] }>('/api/media/list', fetcher)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const files = data?.files ?? []
  const filteredFiles = filter === 'all' ? files : files.filter((f) => f.type === filter)

  const toggleSelect = (pathname: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev)
      if (next.has(pathname)) {
        next.delete(pathname)
      } else {
        next.add(pathname)
      }
      return next
    })
  }

  const selectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set())
    } else {
      setSelectedFiles(new Set(filteredFiles.map((f) => f.pathname)))
    }
  }

  const handleUpload = useCallback(async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    const totalFiles = fileList.length
    let completed = 0

    for (const file of Array.from(fileList)) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'uploads')

      try {
        const res = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const err = await res.json()
          toast.error(`Failed to upload ${file.name}: ${err.error}`)
        } else {
          completed++
          setUploadProgress(Math.round((completed / totalFiles) * 100))
        }
      } catch {
        toast.error(`Failed to upload ${file.name}`)
      }
    }

    await mutate('/api/media/list')
    setUploading(false)
    setUploadProgress(0)
    toast.success(`Uploaded ${completed} file${completed !== 1 ? 's' : ''}`)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const handleDelete = async () => {
    if (selectedFiles.size === 0) return

    setDeleting(true)
    let deleted = 0

    for (const pathname of selectedFiles) {
      try {
        const res = await fetch('/api/media/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pathname }),
        })
        if (res.ok) deleted++
      } catch {
        // continue
      }
    }

    await mutate('/api/media/list')
    setSelectedFiles(new Set())
    setDeleting(false)
    toast.success(`Deleted ${deleted} file${deleted !== 1 ? 's' : ''}`)
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      handleUpload(e.dataTransfer.files)
    },
    [handleUpload]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const copyToClipboard = (pathname: string) => {
    const url = `/api/media/file?pathname=${encodeURIComponent(pathname)}`
    navigator.clipboard.writeText(url)
    toast.success('URL copied to clipboard')
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-background">
      {/* Header */}
      <header className="shrink-0 border-b border-border/60 bg-card/50 backdrop-blur-sm px-4 sm:px-6 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Media Library</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {files.length} file{files.length !== 1 ? 's' : ''} &middot; Upload images and videos for your posts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Uploading {uploadProgress}%
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Upload
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="shrink-0 border-b border-border/60 bg-card/30 px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1">
          {(['all', 'image', 'video'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition',
                filter === f ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {f === 'all' ? 'All' : f === 'image' ? 'Images' : 'Videos'}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1 ml-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'rounded-md p-1.5 transition',
              viewMode === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label="Grid view"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
              />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'rounded-md p-1.5 transition',
              viewMode === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label="List view"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
            </svg>
          </button>
        </div>

        {/* Bulk actions */}
        {selectedFiles.size > 0 && (
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border/60">
            <span className="text-xs text-muted-foreground">{selectedFiles.size} selected</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/20 transition disabled:opacity-50"
            >
              {deleting ? (
                <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              )}
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-auto p-4 sm:p-6"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <svg className="h-8 w-8 animate-spin text-muted-foreground" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <svg className="h-12 w-12 text-muted-foreground/50 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-muted-foreground">Failed to load media</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border/60 rounded-xl text-center cursor-pointer hover:border-primary/50 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg className="h-12 w-12 text-muted-foreground/50 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <p className="text-muted-foreground font-medium mb-1">No media yet</p>
            <p className="text-sm text-muted-foreground/70">Drag and drop files or click to upload</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {/* Select all checkbox */}
            <button
              onClick={selectAll}
              className="aspect-square rounded-xl border-2 border-dashed border-border/60 flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition text-muted-foreground hover:text-foreground"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium">
                {selectedFiles.size === filteredFiles.length ? 'Deselect All' : 'Select All'}
              </span>
            </button>

            {filteredFiles.map((file) => (
              <div
                key={file.pathname}
                className={cn(
                  'group relative aspect-square rounded-xl overflow-hidden border-2 transition cursor-pointer',
                  selectedFiles.has(file.pathname) ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-border'
                )}
                onClick={() => toggleSelect(file.pathname)}
              >
                {file.type === 'video' ? (
                  <video
                    src={`/api/media/file?pathname=${encodeURIComponent(file.pathname)}`}
                    className="h-full w-full object-cover"
                    muted
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/media/file?pathname=${encodeURIComponent(file.pathname)}`}
                    alt={file.filename}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}

                {/* Video badge */}
                {file.type === 'video' && (
                  <div className="absolute top-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    VIDEO
                  </div>
                )}

                {/* Selection checkbox */}
                <div
                  className={cn(
                    'absolute top-2 right-2 h-5 w-5 rounded-full border-2 flex items-center justify-center transition',
                    selectedFiles.has(file.pathname)
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-black/40 border-white/50 opacity-0 group-hover:opacity-100'
                  )}
                >
                  {selectedFiles.has(file.pathname) && (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreviewFile(file)
                    }}
                    className="rounded-full bg-white/20 p-2 hover:bg-white/30 transition"
                    aria-label="Preview"
                  >
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      copyToClipboard(file.pathname)
                    }}
                    className="rounded-full bg-white/20 p-2 hover:bg-white/30 transition"
                    aria-label="Copy URL"
                  >
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                  </button>
                </div>

                {/* File info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                  <p className="text-[10px] text-white/80 truncate">{file.filename}</p>
                  <p className="text-[9px] text-white/50">{formatBytes(file.size)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List view */
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="p-3 text-left font-medium text-muted-foreground w-10">
                    <input
                      type="checkbox"
                      checked={selectedFiles.size === filteredFiles.length && filteredFiles.length > 0}
                      onChange={selectAll}
                      className="rounded border-border"
                    />
                  </th>
                  <th className="p-3 text-left font-medium text-muted-foreground">File</th>
                  <th className="p-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Type</th>
                  <th className="p-3 text-left font-medium text-muted-foreground hidden md:table-cell">Size</th>
                  <th className="p-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Uploaded</th>
                  <th className="p-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file) => (
                  <tr
                    key={file.pathname}
                    className={cn(
                      'border-b border-border/40 hover:bg-muted/20 transition cursor-pointer',
                      selectedFiles.has(file.pathname) && 'bg-primary/5'
                    )}
                    onClick={() => toggleSelect(file.pathname)}
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.pathname)}
                        onChange={() => toggleSelect(file.pathname)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-border"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                          {file.type === 'video' ? (
                            <video
                              src={`/api/media/file?pathname=${encodeURIComponent(file.pathname)}`}
                              className="h-full w-full object-cover"
                              muted
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`/api/media/file?pathname=${encodeURIComponent(file.pathname)}`}
                              alt={file.filename}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          )}
                        </div>
                        <span className="font-medium truncate max-w-[200px]">{file.filename}</span>
                      </div>
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      <span className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                        file.type === 'video' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      )}>
                        {file.type}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell">{formatBytes(file.size)}</td>
                    <td className="p-3 text-muted-foreground hidden lg:table-cell">{formatDate(file.uploadedAt)}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setPreviewFile(file)
                          }}
                          className="rounded-md p-1.5 hover:bg-muted transition"
                          aria-label="Preview"
                        >
                          <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            copyToClipboard(file.pathname)
                          }}
                          className="rounded-md p-1.5 hover:bg-muted transition"
                          aria-label="Copy URL"
                        >
                          <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full bg-card rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <div>
                <p className="font-medium truncate">{previewFile.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(previewFile.size)} &middot; {formatDate(previewFile.uploadedAt)}
                </p>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="rounded-full p-1.5 hover:bg-muted transition"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-center p-4 bg-muted/20 max-h-[70vh] overflow-auto">
              {previewFile.type === 'video' ? (
                <video
                  src={`/api/media/file?pathname=${encodeURIComponent(previewFile.pathname)}`}
                  controls
                  autoPlay
                  className="max-w-full max-h-[60vh] rounded-lg"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/media/file?pathname=${encodeURIComponent(previewFile.pathname)}`}
                  alt={previewFile.filename}
                  className="max-w-full max-h-[60vh] rounded-lg object-contain"
                />
              )}
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-border/60 px-4 py-3">
              <button
                onClick={() => copyToClipboard(previewFile.pathname)}
                className="inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm font-medium hover:bg-muted/80 transition"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
                Copy URL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
