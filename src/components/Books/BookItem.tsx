import React, { useState, useRef } from 'react';
import { Book, BookStatus } from '../../types/Book';
import { Edit2, Trash2, Save, X, BookOpen, Clock, CheckCircle, Star, FileText, Upload, Image } from 'lucide-react';

interface BookItemProps {
  book: Book;
  onUpdateBook: (id: string, updates: Partial<Book>) => Promise<void>;
  onDeleteBook: (id: string) => Promise<void>;
}

const BookItem: React.FC<BookItemProps> = ({ book, onUpdateBook, onDeleteBook }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editData, setEditData] = useState({
    title: book.title,
    author: book.author,
    status: book.status,
    notes: book.notes || '',
    genre: book.genre || '',
    pageCount: book.pageCount?.toString() || '',
    currentPage: book.currentPage?.toString() || '',
    rating: book.rating?.toString() || '',
    coverArt: book.coverArt || ''
  });

  const statusConfig = {
    'To Read': {
      icon: BookOpen,
      color: 'text-status-to-read',
      bgColor: 'bg-status-to-read border-status-to-read',
      borderColor: 'border-status-to-read',
      emoji: '📚'
    },
    'Reading': {
      icon: Clock,
      color: 'text-status-reading',
      bgColor: 'bg-status-reading border-status-reading',
      borderColor: 'border-status-reading',
      emoji: '📖'
    },
    'Completed': {
      icon: CheckCircle,
      color: 'text-status-completed',
      bgColor: 'bg-status-completed border-status-completed',
      borderColor: 'border-status-completed',
      emoji: '✅'
    }
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const updates: Partial<Book> = {
        title: editData.title,
        author: editData.author,
        status: editData.status,
        notes: editData.notes || undefined,
        genre: editData.genre || undefined,
        pageCount: editData.pageCount ? parseInt(editData.pageCount) : undefined,
        currentPage: editData.currentPage ? parseInt(editData.currentPage) : undefined,
        rating: editData.rating ? parseInt(editData.rating) : undefined,
        coverArt: editData.coverArt || undefined
      };

      if (editData.status === 'Completed' && book.status !== 'Completed') {
        updates.completedDate = new Date().toISOString();
      }

      await onUpdateBook(book.id, updates);
      setIsEditing(false);
      setCoverPreview(null);
    } catch (error) {
      console.error('Error updating book:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      title: book.title,
      author: book.author,
      status: book.status,
      notes: book.notes || '',
      genre: book.genre || '',
      pageCount: book.pageCount?.toString() || '',
      currentPage: book.currentPage?.toString() || '',
      rating: book.rating?.toString() || '',
      coverArt: book.coverArt || ''
    });
    setCoverPreview(null);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size must be less than 2MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setEditData(prev => ({ ...prev, coverArt: base64String }));
        setCoverPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCover = () => {
    setEditData(prev => ({ ...prev, coverArt: '' }));
    setCoverPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this book from your reading list?')) {
      try {
        await onDeleteBook(book.id);
      } catch (error) {
        console.error('Error deleting book:', error);
      }
    }
  };

  const StatusIcon = statusConfig[book.status].icon;
  const progress = book.pageCount && book.currentPage 
    ? Math.round((book.currentPage / book.pageCount) * 100) 
    : null;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}
      />
    ));
  };

  return (
    <div className="bg-card border-2 border-border rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      {isEditing ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cover Art Section */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Cover Art</label>
              <div className="space-y-3">
                {(coverPreview || editData.coverArt) ? (
                  <div className="relative group">
                    <img
                      src={coverPreview || editData.coverArt}
                      alt="Book cover"
                      className="w-full h-40 object-cover rounded-xl border-2 border-border"
                    />
                    <button
                      type="button"
                      onClick={removeCover}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-40 border-2 border-dashed border-muted-foreground/30 rounded-xl flex flex-col items-center justify-center bg-muted/20">
                    <Image size={32} className="text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground text-center">No cover</p>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  disabled={isUpdating}
                  className="hidden"
                />
                
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUpdating}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2 px-3 rounded-lg hover:bg-primary/90 transition-all text-sm"
                  >
                    <Upload size={14} />
                    {editData.coverArt ? 'Change' : 'Upload'}
                  </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editData.title}
                    onChange={handleChange}
                    disabled={isUpdating}
                    className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">Author</label>
                  <input
                    type="text"
                    name="author"
                    value={editData.author}
                    onChange={handleChange}
                    disabled={isUpdating}
                    className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">Status</label>
                  <select
                    name="status"
                    value={editData.status}
                    onChange={handleChange}
                    disabled={isUpdating}
                    className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                  >
                    <option value="To Read">📚 To Read</option>
                    <option value="Reading">📖 Reading</option>
                    <option value="Completed">✅ Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">Genre</label>
                  <input
                    type="text"
                    name="genre"
                    value={editData.genre}
                    onChange={handleChange}
                    disabled={isUpdating}
                    className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">Rating</label>
                  <select
                    name="rating"
                    value={editData.rating}
                    onChange={handleChange}
                    disabled={isUpdating}
                    className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                  >
                    <option value="">No rating</option>
                    <option value="1">⭐ 1 Star</option>
                    <option value="2">⭐⭐ 2 Stars</option>
                    <option value="3">⭐⭐⭐ 3 Stars</option>
                    <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                    <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">Total Pages</label>
                  <input
                    type="number"
                    name="pageCount"
                    value={editData.pageCount}
                    onChange={handleChange}
                    min="1"
                    disabled={isUpdating}
                    className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">Current Page</label>
                  <input
                    type="number"
                    name="currentPage"
                    value={editData.currentPage}
                    onChange={handleChange}
                    min="0"
                    max={editData.pageCount || undefined}
                    disabled={isUpdating}
                    className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={editData.notes}
                  onChange={handleChange}
                  rows={3}
                  disabled={isUpdating}
                  className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground resize-none"
                  placeholder="Add your thoughts about this book..."
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary/90 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isUpdating}
              className="flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-xl hover:bg-secondary/80 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Cover Art */}
          <div className="flex-shrink-0">
            {book.coverArt ? (
              <img
                src={book.coverArt}
                alt={`${book.title} cover`}
                className="w-24 h-32 object-cover rounded-xl border-2 border-border shadow-md"
              />
            ) : (
              <div className="w-24 h-32 bg-muted rounded-xl border-2 border-border flex items-center justify-center">
                <BookOpen size={32} className="text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-foreground mb-1 truncate">{book.title}</h3>
                <p className="text-muted-foreground mb-3 font-medium">by {book.author}</p>
                
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold border-2 ${statusConfig[book.status].bgColor} ${statusConfig[book.status].color} ${statusConfig[book.status].borderColor}`}>
                    <span className="text-lg">{statusConfig[book.status].emoji}</span>
                    <span className='flex '>{book.status}</span>
                  </span>
                  
                  {book.genre && (
                    <span className="px-3 py-1 bg-accent text-accent-foreground text-sm rounded-full font-medium border border-border">
                      {book.genre}
                    </span>
                  )}
                  
                  {book.rating && (
                    <div className="flex items-center gap-1 bg-muted text-foreground px-3 py-1 rounded-full border border-border">
                      {renderStars(book.rating)}
                    </div>
                  )}
                </div>

                {progress !== null && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm font-medium text-muted-foreground mb-2">
                      <span>Reading Progress</span>
                      <span>{book.currentPage} / {book.pageCount} pages ({progress}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 border border-border">
                      <div 
                        className="bg-primary h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  <span className="font-medium">Added: {new Date(book.dateAdded).toLocaleDateString()}</span>
                  {book.completedDate && (
                    <span className="font-medium text-primary">
                      Completed: {new Date(book.completedDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {book.notes && (
                  <div className="p-4 bg-accent/50 rounded-xl border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={16} className="text-primary" />
                      <span className="text-sm font-semibold text-foreground">Notes</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{book.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-3 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-primary/20"
                  title="Edit book"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-destructive/20"
                  title="Delete book"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookItem;