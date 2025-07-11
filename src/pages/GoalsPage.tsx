import React, { useState } from 'react';
import { Book } from '../types/Book';
import { Target, Plus, Calendar, TrendingUp, Award, BookOpen } from 'lucide-react';
import StatsCard from '../components/Dashboard/StatsCard';

interface GoalsPageProps {
  books: Book[];
}

const GoalsPage: React.FC<GoalsPageProps> = ({ books }) => {
  const [yearlyGoal, setYearlyGoal] = useState(() => {
    const saved = localStorage.getItem('reading-yearly-goal');
    return saved ? parseInt(saved) : 12;
  });
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState(yearlyGoal.toString());

  const currentYear = new Date().getFullYear();
  const completedThisYear = books.filter(book => {
    if (!book.completedDate) return false;
    return new Date(book.completedDate).getFullYear() === currentYear;
  }).length;

  const progress = yearlyGoal > 0 ? Math.round((completedThisYear / yearlyGoal) * 100) : 0;
  const remainingBooks = Math.max(0, yearlyGoal - completedThisYear);
  const daysInYear = new Date(currentYear, 11, 31).getDate() === 31 ? 366 : 365;
  const daysPassed = Math.floor((Date.now() - new Date(currentYear, 0, 1).getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = daysInYear - daysPassed;
  const booksPerMonth = remainingBooks > 0 && daysRemaining > 0 ? (remainingBooks / (daysRemaining / 30)).toFixed(1) : '0';

  const handleSaveGoal = () => {
    const goal = parseInt(newGoal);
    if (goal > 0) {
      setYearlyGoal(goal);
      localStorage.setItem('reading-yearly-goal', goal.toString());
      setShowGoalForm(false);
    }
  };

  // Monthly progress
  const monthlyProgress = Array.from({ length: 12 }, (_, i) => {
    const month = i;
    const monthlyCompleted = books.filter(book => {
      if (!book.completedDate) return false;
      const date = new Date(book.completedDate);
      return date.getFullYear() === currentYear && date.getMonth() === month;
    }).length;
    
    return {
      month: new Date(currentYear, month).toLocaleDateString('en-US', { month: 'short' }),
      completed: monthlyCompleted,
      target: Math.round(yearlyGoal / 12)
    };
  });

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Reading Goals</h2>
        <p className="text-muted-foreground">Track your progress and stay motivated</p>
      </div>

      {/* Current Year Goal */}
      <div className="bg-card border border-border rounded-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Target size={32} className="text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">{currentYear} Reading Goal</h3>
              <p className="text-muted-foreground">
                {completedThisYear} of {yearlyGoal} books completed
              </p>
            </div>
          </div>

          {/* Progress Circle */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
                className="text-primary transition-all duration-500"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{progress}%</div>
                <div className="text-xs text-muted-foreground">Complete</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowGoalForm(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus size={16} />
              Update Goal
            </button>
          </div>
        </div>

        {showGoalForm && (
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-foreground">
                Books to read in {currentYear}:
              </label>
              <input
                type="number"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                min="1"
                className="w-20 px-3 py-1 bg-background border border-border rounded text-foreground"
              />
              <button
                onClick={handleSaveGoal}
                className="bg-primary text-primary-foreground px-4 py-1 rounded hover:bg-primary/90 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setShowGoalForm(false)}
                className="bg-muted text-muted-foreground px-4 py-1 rounded hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Goal Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Books Remaining"
          value={remainingBooks}
          icon={BookOpen}
          className="border-l-4 border-l-blue-500"
        />
        
        <StatsCard
          title="Books per Month"
          value={booksPerMonth}
          icon={Calendar}
          className="border-l-4 border-l-green-500"
        />
        
        <StatsCard
          title="Days Remaining"
          value={daysRemaining}
          icon={TrendingUp}
          className="border-l-4 border-l-amber-500"
        />
        
        <StatsCard
          title="Goal Progress"
          value={`${progress}%`}
          icon={Award}
          className="border-l-4 border-l-purple-500"
        />
      </div>

      {/* Monthly Progress Chart */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calendar size={20} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Monthly Progress</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {monthlyProgress.map((month, index) => {
            const isCurrentMonth = index === new Date().getMonth();
            const achievedTarget = month.completed >= month.target;
            
            return (
              <div
                key={month.month}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isCurrentMonth
                    ? 'border-primary bg-primary/5'
                    : achievedTarget
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : 'border-border bg-muted/30'
                }`}
              >
                <div className="text-center">
                  <div className="text-sm font-medium text-foreground mb-1">
                    {month.month}
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {month.completed}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    of {month.target} target
                  </div>
                  {achievedTarget && month.completed > 0 && (
                    <div className="mt-2">
                      <Award size={16} className="text-green-600 dark:text-green-400 mx-auto" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivational Section */}
      {progress < 100 && remainingBooks > 0 && (
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-border rounded-xl p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">Keep Going!</h3>
            <p className="text-muted-foreground mb-4">
              You need to read approximately <strong>{booksPerMonth}</strong> books per month 
              to reach your goal of <strong>{yearlyGoal}</strong> books this year.
            </p>
            {completedThisYear > 0 && (
              <p className="text-sm text-muted-foreground">
                You've already completed <strong>{completedThisYear}</strong> books. 
                That's <strong>{progress}%</strong> of your goal!
              </p>
            )}
          </div>
        </div>
      )}

      {progress >= 100 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <div className="text-center">
            <div className="mb-4">
              <Award size={48} className="text-green-600 dark:text-green-400 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
              Congratulations! 🎉
            </h3>
            <p className="text-green-700 dark:text-green-300">
              You've reached your reading goal for {currentYear}! 
              You've read <strong>{completedThisYear}</strong> books out of your target of <strong>{yearlyGoal}</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsPage;