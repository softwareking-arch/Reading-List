import React from 'react';
import { Book } from '../../types/Book';
import StatsCard from './StatsCard';
import { BookOpen, Clock, CheckCircle, TrendingUp, Calendar, Target } from 'lucide-react';

interface DashboardProps {
  books: Book[];
}

const Dashboard: React.FC<DashboardProps> = ({ books }) => {
  const toReadCount = books.filter(book => book.status === 'To Read').length;
  const readingCount = books.filter(book => book.status === 'Reading').length;
  const completedCount = books.filter(book => book.status === 'Completed').length;
  const totalBooks = books.length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthCompleted = books.filter(book => {
    if (!book.completedDate) return false;
    const completedDate = new Date(book.completedDate);
    return completedDate.getMonth() === currentMonth && 
           completedDate.getFullYear() === currentYear;
  }).length;

  const booksWithPages = books.filter(book => book.pageCount);
  const averagePages = booksWithPages.length > 0 
    ? Math.round(booksWithPages.reduce((sum, book) => sum + (book.pageCount || 0), 0) / booksWithPages.length)
    : 0;

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary pb-6">
          📚 My Reading Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">Track your reading journey and celebrate your progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="📚 To Read"
          value={toReadCount}
          icon={BookOpen}
          className="bg-dashboard-primary border-2 border-dashboard-primary hover:shadow-dashboard-primary"
        />
        
        <StatsCard
          title="📖 Reading Now"
          value={readingCount}
          icon={Clock}
          className="bg-dashboard-secondary border-2 border-dashboard-secondary hover:shadow-dashboard-secondary"
        />
        
        <StatsCard
          title="✅ Completed"
          value={completedCount}
          icon={CheckCircle}
          className="bg-dashboard-success border-2 border-dashboard-success hover:shadow-dashboard-success"
        />
        
        <StatsCard
          title="📊 Total Books"
          value={totalBooks}
          icon={TrendingUp}
          className="bg-dashboard-accent border-2 border-dashboard-accent hover:shadow-dashboard-accent"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-dashboard-activity border-2 border-dashboard-activity rounded-2xl p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary rounded-xl text-primary-foreground shadow-lg">
            <Calendar size={24} />
          </div>
          <h3 className="text-2xl font-bold text-foreground">🎉 Recent Achievements</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {books
            .filter(book => book.completedDate)
            .sort((a, b) => new Date(b.completedDate!).getTime() - new Date(a.completedDate!).getTime())
            .slice(0, 6)
            .map(book => (
              <div key={book.id} className="bg-card/70 backdrop-blur-sm p-4 rounded-xl border border-border hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-3">
                  {book.coverArt ? (
                    <img
                      src={book.coverArt}
                      alt={book.title}
                      className="w-12 h-16 object-cover rounded-lg border border-border shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-16 bg-muted rounded-lg border border-border flex items-center justify-center">
                      <BookOpen size={16} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{book.title}</p>
                    <p className="text-xs text-muted-foreground mb-2 truncate">by {book.author}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-status-completed text-status-completed px-2 py-1 rounded-full border border-status-completed font-medium">
                        ✅ Completed
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(book.completedDate!).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          
          {books.filter(book => book.completedDate).length === 0 && (
            <div className="col-span-full text-center py-8">
              <div className="text-6xl mb-4">📖</div>
              <p className="text-muted-foreground text-lg">No completed books yet!</p>
              <p className="text-muted-foreground text-sm">Start reading to see your achievements here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;