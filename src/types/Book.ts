export interface Book {
  id: string;
  title: string;
  author: string;
  status: 'To Read' | 'Reading' | 'Completed';
  dateAdded: string;
  notes?: string;
  completedDate?: string;
  genre?: string;
  rating?: number;
  pageCount?: number;
  currentPage?: number;
  coverArt?: string; // Base64 encoded image data
}

export type BookStatus = 'To Read' | 'Reading' | 'Completed';

export interface ReadingGoal {
  id: string;
  year: number;
  targetBooks: number;
  completedBooks: number;
  createdAt: string;
}

export interface ReadingSession {
  id: string;
  bookId: string;
  date: string;
  pagesRead: number;
  timeSpent: number; // in minutes
  notes?: string;
}