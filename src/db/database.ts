import Dexie, { Table } from 'dexie';
import { Book, ReadingGoal, ReadingSession } from '../types/Book';

export class ReadingListDatabase extends Dexie {
  books!: Table<Book>;
  goals!: Table<ReadingGoal>;
  sessions!: Table<ReadingSession>;

  constructor() {
    super('ReadingListDatabase');
    
    this.version(1).stores({
      books: 'id, title, author, status, dateAdded, completedDate, genre',
      goals: 'id, year, targetBooks, completedBooks, createdAt',
      sessions: 'id, bookId, date, pagesRead, timeSpent'
    });
  }
}

export const db = new ReadingListDatabase();