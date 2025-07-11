import React from 'react';
import { Book } from '../types/Book';
import { BarChart3, TrendingUp, Calendar, Clock, Star, BookOpen } from 'lucide-react';
import StatsCard from '../components/Dashboard/StatsCard';

interface AnalyticsPageProps {
  books: Book[];
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ books }) => {
  // Calculate reading statistics
  const completedBooks = books.filter(book => book.status === 'Completed');
  const booksWithRatings = books.filter(book => book.rating);
  const averageRating = booksWithRatings.length > 0 
    ? (booksWithRatings.reduce((sum, book) => sum + (book.rating || 0), 0) / booksWithRatings.length).toFixed(1)
    : 0;

  // Monthly reading data
  const monthlyData = completedBooks.reduce((acc, book) => {
    if (!book.completedDate) return acc;
    const date = new Date(book.completedDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    acc[monthKey] = (acc[monthKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Genre distribution
  const genreData = books.reduce((acc, book) => {
    if (book.genre) {
      acc[book.genre] = (acc[book.genre] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Reading streak calculation
  const currentYear = new Date().getFullYear();
  const thisYearCompleted = completedBooks.filter(book => {
    if (!book.completedDate) return false;
    return new Date(book.completedDate).getFullYear() === currentYear;
  }).length;

  // Pages read calculation
  const totalPagesRead = completedBooks.reduce((sum, book) => {
    return sum + (book.pageCount || 0);
  }, 0);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}
      />
    ));
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Reading Analytics</h2>
        <p className="text-muted-foreground">Insights into your reading journey</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Books This Year"
          value={thisYearCompleted}
          icon={Calendar}
          className="border-l-4 border-l-blue-500"
        />
        
        <StatsCard
          title="Average Rating"
          value={averageRating}
          icon={Star}
          className="border-l-4 border-l-yellow-500"
        />
        
        <StatsCard
          title="Total Pages Read"
          value={totalPagesRead.toLocaleString()}
          icon={BookOpen}
          className="border-l-4 border-l-green-500"
        />
        
        <StatsCard
          title="Completion Rate"
          value={`${books.length > 0 ? Math.round((completedBooks.length / books.length) * 100) : 0}%`}
          icon={TrendingUp}
          className="border-l-4 border-l-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Reading Chart */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 size={20} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Monthly Reading</h3>
          </div>
          
          <div className="space-y-4">
            {Object.entries(monthlyData)
              .sort(([a], [b]) => b.localeCompare(a))
              .slice(0, 6)
              .map(([month, count]) => {
                const [year, monthNum] = month.split('-');
                const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                const maxCount = Math.max(...Object.values(monthlyData));
                const percentage = (count / maxCount) * 100;
                
                return (
                  <div key={month} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">{monthName}</span>
                      <span className="text-muted-foreground">{count} books</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            
            {Object.keys(monthlyData).length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No completed books to show monthly data yet.
              </p>
            )}
          </div>
        </div>

        {/* Genre Distribution */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen size={20} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Genre Distribution</h3>
          </div>
          
          <div className="space-y-4">
            {Object.entries(genreData)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 8)
              .map(([genre, count]) => {
                const maxCount = Math.max(...Object.values(genreData));
                const percentage = (count / maxCount) * 100;
                
                return (
                  <div key={genre} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">{genre}</span>
                      <span className="text-muted-foreground">{count} books</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-secondary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            
            {Object.keys(genreData).length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                Add genres to your books to see distribution data.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Completions */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Clock size={20} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Recently Completed</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {completedBooks
            .sort((a, b) => new Date(b.completedDate!).getTime() - new Date(a.completedDate!).getTime())
            .slice(0, 6)
            .map(book => (
              <div key={book.id} className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-foreground mb-1">{book.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">by {book.author}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {new Date(book.completedDate!).toLocaleDateString()}
                  </span>
                  {book.rating && (
                    <div className="flex items-center gap-1">
                      {renderStars(book.rating)}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
        
        {completedBooks.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No completed books yet. Finish reading a book to see it here!
          </p>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;