import React, { useState } from 'react';
import { Book, BookStatus } from '../../types/Book';
import BookItem from './BookItem';
import { Search, Filter, SortAsc, SortDesc, Grid, List } from 'lucide-react';

interface BookListProps {
  books: Book[];
  onUpdateBook: (id: string, updates: Partial<Book>) => Promise<void>;
  onDeleteBook: (id: string) => Promise<void>;
}

type SortField = 'title' | 'author' | 'dateAdded' | 'rating';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

const BookList: React.FC<BookListProps> = ({ books, onUpdateBook, onDeleteBook }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookStatus | 'All'>('All');
  const [genreFilter, setGenreFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('dateAdded');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Get unique genres for filter
  const genres = Array.from(new Set(books.filter(book => book.genre).map(book => book.genre!)));

  // Filter books based on search query, status filter, and genre filter
  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.genre && book.genre.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || book.status === statusFilter;
    const matchesGenre = genreFilter === 'All' || book.genre === genreFilter;
    
    return matchesSearch && matchesStatus && matchesGenre;
  });

  // Sort books
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    let aValue: string | Date | number;
    let bValue: string | Date | number;

    switch (sortField) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'author':
        aValue = a.author.toLowerCase();
        bValue = b.author.toLowerCase();
        break;
      case 'dateAdded':
        aValue = new Date(a.dateAdded);
        bValue = new Date(b.dateAdded);
        break;
      case 'rating':
        aValue = a.rating || 0;
        bValue = b.rating || 0;
        break;
      default:
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = sortDirection === 'asc' ? SortAsc : SortDesc;

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search books by title, author, or genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as BookStatus | 'All')}
                className="px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
              >
                <option value="All">All Status</option>
                <option value="To Read">To Read</option>
                <option value="Reading">Reading</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {genres.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  value={genreFilter}
                  onChange={(e) => setGenreFilter(e.target.value)}
                  className="px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                >
                  <option value="All">All Genres</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort:</span>
              <div className="flex gap-1">
                {[
                  { field: 'title' as SortField, label: 'Title' },
                  { field: 'author' as SortField, label: 'Author' },
                  { field: 'dateAdded' as SortField, label: 'Date' },
                  { field: 'rating' as SortField, label: 'Rating' }
                ].map(({ field, label }) => (
                  <button
                    key={field}
                    onClick={() => handleSort(field)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-sm ${
                      sortField === field 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {label}
                    {sortField === field && <SortIcon size={14} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1 border border-border rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Grid view"
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="List view"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Books Display */}
      {sortedBooks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Search size={48} className="mx-auto" />
          </div>
          <p className="text-muted-foreground text-lg">
            {searchQuery || statusFilter !== 'All' || genreFilter !== 'All'
              ? 'No books found matching your criteria.' 
              : 'No books in your reading list yet.'}
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            {searchQuery || statusFilter !== 'All' || genreFilter !== 'All'
              ? 'Try adjusting your search or filter settings.' 
              : 'Add your first book to get started!'}
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {sortedBooks.map(book => (
            <BookItem
              key={book.id}
              book={book}
              onUpdateBook={onUpdateBook}
              onDeleteBook={onDeleteBook}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookList;