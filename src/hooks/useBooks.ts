import { useState, useEffect } from 'react';
import { Book } from '../types/Book';
import { db } from '../db/database';

export const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const allBooks = await db.books.toArray();
      setBooks(allBooks);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  const addBook = async (bookData: Omit<Book, 'id' | 'dateAdded'>) => {
    try {
      const newBook: Book = {
        ...bookData,
        id: crypto.randomUUID(),
        dateAdded: new Date().toISOString()
      };
      
      await db.books.add(newBook);
      setBooks(prev => [...prev, newBook]);
      return newBook;
    } catch (error) {
      console.error('Error adding book:', error);
      throw error;
    }
  };

  const updateBook = async (id: string, updates: Partial<Book>) => {
    try {
      await db.books.update(id, updates);
      setBooks(prev => 
        prev.map(book => 
          book.id === id ? { ...book, ...updates } : book
        )
      );
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  };

  const deleteBook = async (id: string) => {
    try {
      await db.books.delete(id);
      setBooks(prev => prev.filter(book => book.id !== id));
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  };

  return {
    books,
    loading,
    addBook,
    updateBook,
    deleteBook,
    refreshBooks: loadBooks
  };
};