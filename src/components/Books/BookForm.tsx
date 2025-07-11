import React, { useState, useRef } from 'react';
import { Book, BookStatus } from '../../types/Book';
import { Plus, X, BookOpen, Upload, Image } from 'lucide-react';

interface BookFormProps {
  onAddBook: (book: Omit<Book, 'id' | 'dateAdded'>) => Promise<Book>;
}

const BookForm: React.FC<BookFormProps> = ({ onAddBook }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    status: 'To Read' as BookStatus,
    notes: '',
    genre: '',
    pageCount: '',
    currentPage: '',
    rating: '',
    coverArt: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim() && formData.author.trim()) {
      setIsSubmitting(true);
      try {
        const bookData: Omit<Book, 'id' | 'dateAdded'> = {
          title: formData.title.trim(),
          author: formData.author.trim(),
          status: formData.status,
          notes: formData.notes.trim() || undefined,
          genre: formData.genre.trim() || undefined,
          pageCount: formData.pageCount ? parseInt(formData.pageCount) : undefined,
          currentPage: formData.currentPage ? parseInt(formData.currentPage) : undefined,
          rating: formData.rating ? parseInt(formData.rating) : undefined,
          coverArt: formData.coverArt || undefined
        };

        await onAddBook(bookData);
        
        setFormData({
          title: '',
          author: '',
          status: 'To Read',
          notes: '',
          genre: '',
          pageCount: '',
          currentPage: '',
          rating: '',
          coverArt: ''
        });
        setCoverPreview(null);
        setIsOpen(false);
      } catch (error) {
        console.error('Error adding book:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size must be less than 2MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setFormData(prev => ({ ...prev, coverArt: base64String }));
        setCoverPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCover = () => {
    setFormData(prev => ({ ...prev, coverArt: '' }));
    setCoverPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) {
    return (
      <div className="flex justify-center mb-8">
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-lg"
        >
          <Plus size={24} />
          Add New Book
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card border-2 border-primary/20 rounded-2xl shadow-xl p-8 mb-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
            <BookOpen size={28} />
          </div>
          <h3 className="text-2xl font-bold text-foreground">Add New Book</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-lg"
          disabled={isSubmitting}
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cover Art Upload */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-semibold text-foreground mb-3">
              Book Cover
            </label>
            <div className="space-y-4">
              {coverPreview ? (
                <div className="relative group">
                  <img
                    src={coverPreview}
                    alt="Book cover preview"
                    className="w-full h-64 object-cover rounded-xl border-2 border-border shadow-md"
                  />
                  <button
                    type="button"
                    onClick={removeCover}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="w-full h-64 border-2 border-dashed border-muted-foreground/30 rounded-xl flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/40 transition-colors">
                  <Image size={48} className="text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-center text-sm">
                    Click to upload cover art<br />
                    <span className="text-xs">(Max 2MB, JPG/PNG)</span>
                  </p>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                disabled={isSubmitting}
                className="hidden"
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 px-4 rounded-xl hover:from-green-600 hover:to-teal-700 transition-all duration-200 font-medium"
              >
                <Upload size={18} />
                {coverPreview ? 'Change Cover' : 'Upload Cover'}
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-foreground mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground font-medium"
                  placeholder="Enter book title"
                />
              </div>

              <div>
                <label htmlFor="author" className="block text-sm font-semibold text-foreground mb-2">
                  Author *
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground font-medium"
                  placeholder="Enter author name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="status" className="block text-sm font-semibold text-foreground mb-2">
                  Reading Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground font-medium"
                >
                  <option value="To Read">📚 To Read</option>
                  <option value="Reading">📖 Reading</option>
                  <option value="Completed">✅ Completed</option>
                </select>
              </div>

              <div>
                <label htmlFor="genre" className="block text-sm font-semibold text-foreground mb-2">
                  Genre
                </label>
                <input
                  type="text"
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground font-medium"
                  placeholder="e.g., Fiction, Mystery"
                />
              </div>

              <div>
                <label htmlFor="rating" className="block text-sm font-semibold text-foreground mb-2">
                  Rating
                </label>
                <select
                  id="rating"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground font-medium"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="pageCount" className="block text-sm font-semibold text-foreground mb-2">
                  Total Pages
                </label>
                <input
                  type="number"
                  id="pageCount"
                  name="pageCount"
                  value={formData.pageCount}
                  onChange={handleChange}
                  min="1"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground font-medium"
                  placeholder="e.g., 350"
                />
              </div>

              <div>
                <label htmlFor="currentPage" className="block text-sm font-semibold text-foreground mb-2">
                  Current Page
                </label>
                <input
                  type="number"
                  id="currentPage"
                  name="currentPage"
                  value={formData.currentPage}
                  onChange={handleChange}
                  min="0"
                  max={formData.pageCount || undefined}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground font-medium"
                  placeholder="e.g., 150"
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-semibold text-foreground mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground font-medium resize-none"
                placeholder="Add your thoughts, impressions, or notes about this book..."
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isSubmitting ? 'Adding Book...' : 'Add Book'}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-4 px-6 rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-200 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookForm;