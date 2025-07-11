import React, { useState, useEffect } from 'react';
import { Book } from './types/Book';
import { useTheme } from './hooks/useTheme';
import { useBooks } from './hooks/useBooks';
import Navigation from './components/Layout/Navigation';
import LibraryPage from './pages/LibraryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import GoalsPage from './pages/GoalsPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const [currentPage, setCurrentPage] = useState('library');
  const { theme, setTheme } = useTheme();
  const { books, loading, addBook, updateBook, deleteBook } = useBooks();

  const handleBooksImport = (importedBooks: Book[]) => {
    // This will trigger a re-render and the useBooks hook will reload data
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your reading list...</p>
        </div>
      </div>
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'library':
        return (
          <LibraryPage
            books={books}
            onAddBook={addBook}
            onUpdateBook={updateBook}
            onDeleteBook={deleteBook}
          />
        );
      case 'analytics':
        return <AnalyticsPage books={books} />;
      case 'goals':
        return <GoalsPage books={books} />;
      case 'settings':
        return (
          <SettingsPage
            books={books}
            theme={theme}
            onThemeChange={setTheme}
            onBooksImport={handleBooksImport}
          />
        );
      default:
        return (
          <LibraryPage
            books={books}
            onAddBook={addBook}
            onUpdateBook={updateBook}
            onDeleteBook={deleteBook}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        theme={theme}
        onThemeChange={setTheme}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {renderCurrentPage()}
      </main>
    </div>
  );
}

export default App;