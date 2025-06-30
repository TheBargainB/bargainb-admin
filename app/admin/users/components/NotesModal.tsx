"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, Plus, Calendar, User, MessageSquare } from "lucide-react"

type Note = {
  id: string
  title: string
  content: string
  note_type: 'general' | 'support' | 'feedback' | 'complaint' | 'compliment' | 'order'
  created_at: string
  created_by: string
}

type CRMUser = {
  contact_id: string
  phone_number: string
  full_name: string | null
  preferred_name: string | null
}

interface NotesModalProps {
  user: CRMUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotesModal({ user, open, onOpenChange }: NotesModalProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    note_type: 'general' as const
  })

  // Fetch real customer notes from database
  useEffect(() => {
    if (open && user) {
      setLoading(true)
      // TODO: Implement API call to fetch real customer notes
      // For now, show empty state until real notes data exists
      setTimeout(() => {
        setNotes([]) // No mock data - show real empty state
        setLoading(false)
      }, 200)
    }
  }, [open, user])

  const handleAddNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      note_type: newNote.note_type,
      created_at: new Date().toISOString(),
      created_by: "Admin"
    }

    setNotes(prev => [note, ...prev])
    setNewNote({ title: '', content: '', note_type: 'general' })
    setIsAddingNote(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getNoteTypeColor = (type: string) => {
    const colors = {
      general: "bg-gray-100 text-gray-800",
      support: "bg-blue-100 text-blue-800",
      feedback: "bg-purple-100 text-purple-800",
      complaint: "bg-red-100 text-red-800",
      compliment: "bg-green-100 text-green-800",
      order: "bg-orange-100 text-orange-800",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getNoteTypeIcon = (type: string) => {
    switch (type) {
      case 'support':
        return '🔧'
      case 'feedback':
        return '💭'
      case 'complaint':
        return '⚠️'
      case 'compliment':
        return '👍'
      case 'order':
        return '🛒'
      default:
        return '📝'
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Customer Notes - {user.full_name || user.preferred_name}
            </DialogTitle>
            <Button onClick={() => setIsAddingNote(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading notes...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Add New Note Form */}
            {isAddingNote && (
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg">Add New Note</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="note-title">Note Title</Label>
                      <Input
                        id="note-title"
                        value={newNote.title}
                        onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter note title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="note-type">Note Type</Label>
                      <select
                        id="note-type"
                        value={newNote.note_type}
                        onChange={(e) => setNewNote(prev => ({ ...prev, note_type: e.target.value as any }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="general">General</option>
                        <option value="support">Support</option>
                        <option value="feedback">Feedback</option>
                        <option value="complaint">Complaint</option>
                        <option value="compliment">Compliment</option>
                        <option value="order">Order</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="note-content">Note Content</Label>
                    <Textarea
                      id="note-content"
                      value={newNote.content}
                      onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Enter note content..."
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddNote} disabled={!newNote.title.trim() || !newNote.content.trim()}>
                      Save Note
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddingNote(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-2xl font-bold">{notes.length}</div>
                      <div className="text-xs text-muted-foreground">Total Notes</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold">{notes.filter(n => n.note_type === 'compliment').length}</div>
                      <div className="text-xs text-muted-foreground">Compliments</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-red-600" />
                    <div>
                      <div className="text-2xl font-bold">{notes.filter(n => n.note_type === 'complaint').length}</div>
                      <div className="text-xs text-muted-foreground">Complaints</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold">{notes.filter(n => n.note_type === 'support').length}</div>
                      <div className="text-xs text-muted-foreground">Support</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notes List */}
            <div className="space-y-4">
              {notes.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Notes</h3>
                    <p className="text-muted-foreground">No notes have been added for this customer yet.</p>
                    <Button onClick={() => setIsAddingNote(true)} className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Note
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                notes.map((note) => (
                  <Card key={note.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{getNoteTypeIcon(note.note_type)}</div>
                          <div>
                            <CardTitle className="text-lg">{note.title}</CardTitle>
                            <CardDescription className="flex items-center gap-4 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(note.created_at)}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {note.created_by}
                              </span>
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getNoteTypeColor(note.note_type)}>
                          {note.note_type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">{note.content}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 