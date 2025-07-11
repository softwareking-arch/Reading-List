import React from 'react';
import { Book } from '../types/Book';
import Dashboard from '../components/Dashboard/Dashboard';
import BookForm from '../components/Books/BookForm';
import BookList from '../components/Books/BookList';

interface LibraryPageProps {
  books: Book[];
  onAddBook: (book: Omit<Book, 'id' | 'dateAdded'>) => Promise<Book>;
  onUpdateBook: (id: string, updates: Partial<Book>) => Promise<void>;
  onDeleteBook: (id: string) => Promise<void>;
}

const LibraryPage: React.FC<LibraryPageProps> = ({
  books,
  onAddBook,
  onUpdateBook,
  onDeleteBook
}) => {
  return (
    <div className="space-y-8">
      {/* Dashboard */}
      <Dashboard books={books} />

      {/* Add Book Form */}
      <div className="flex justify-center">
        <BookForm onAddBook={onAddBook} />
      </div>

      {/* Book List */}
      <BookList 
        books={books} 
        onUpdateBook={onUpdateBook} 
        onDeleteBook={onDeleteBook} 
      />
    </div>
  );
};

export default LibraryPage;