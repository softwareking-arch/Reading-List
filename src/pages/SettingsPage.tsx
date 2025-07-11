import React, { useState } from 'react';
import { Settings, Download, Upload, Trash2, Database, Palette, Info } from 'lucide-react';
import { Book } from '../types/Book';
import { Theme } from '../types/Theme';
import { db } from '../db/database';

interface SettingsPageProps {
  books: Book[];
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onBooksImport: (books: Book[]) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  books, 
  theme, 
  onThemeChange, 
  onBooksImport 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);

  const themeOptions = [
    { value: 'light' as Theme, label: 'Light Theme', description: 'Clean and bright interface' },
    { value: 'dark' as Theme, label: 'Dark Theme', description: 'Easy on the eyes in low light' },
    { value: 'high-contrast' as Theme, label: 'High Contrast', description: 'Enhanced accessibility' }
  ];

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const dataToExport = {
        books,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reading-list-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        
        if (importedData.books && Array.isArray(importedData.books)) {
          const confirmImport = window.confirm(
            `This will import ${importedData.books.length} books. This action cannot be undone. Continue?`
          );
          
          if (confirmImport) {
            // Clear existing data and import new data
            await db.books.clear();
            await db.books.bulkAdd(importedData.books);
            onBooksImport(importedData.books);
            alert('Data imported successfully!');
          }
        } else {
          alert('Invalid file format. Please select a valid backup file.');
        }
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Failed to import data. Please check the file format.');
      } finally {
        setIsImporting(false);
        // Reset the input
        event.target.value = '';
      }
    };

    reader.readAsText(file);
  };

  const handleClearAllData = async () => {
    const confirmClear = window.confirm(
      'This will permanently delete all your books and data. This action cannot be undone. Are you sure?'
    );

    if (confirmClear) {
      const doubleConfirm = window.confirm(
        'Are you absolutely sure? All your reading data will be lost forever.'
      );

      if (doubleConfirm) {
        setIsClearingData(true);
        try {
          await db.books.clear();
          await db.goals.clear();
          await db.sessions.clear();
          localStorage.removeItem('reading-yearly-goal');
          onBooksImport([]);
          alert('All data has been cleared successfully.');
        } catch (error) {
          console.error('Error clearing data:', error);
          alert('Failed to clear data. Please try again.');
        } finally {
          setIsClearingData(false);
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Settings</h2>
        <p className="text-muted-foreground">Customize your reading experience</p>
      </div>

      {/* Theme Settings */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Palette size={20} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Appearance</h3>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Choose your preferred theme for the best reading experience.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onThemeChange(option.value)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  theme === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-medium text-foreground mb-1">{option.label}</div>
                <div className="text-sm text-muted-foreground">{option.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Database size={20} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Data Management</h3>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-foreground mb-2">Export Data</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Download a backup of all your books and reading data as a JSON file.
            </p>
            <button
              onClick={handleExportData}
              disabled={isExporting || books.length === 0}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              {isExporting ? 'Exporting...' : 'Export Data'}
            </button>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-2">Import Data</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Import books from a previously exported backup file. This will replace all current data.
            </p>
            <label className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors cursor-pointer">
              <Upload size={16} />
              {isImporting ? 'Importing...' : 'Import Data'}
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                disabled={isImporting}
                className="hidden"
              />
            </label>
          </div>

          <div className="border-t border-border pt-6">
            <h4 className="font-medium text-foreground mb-2 text-red-600 dark:text-red-400">
              Danger Zone
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete all your reading data. This action cannot be undone.
            </p>
            <button
              onClick={handleClearAllData}
              disabled={isClearingData || books.length === 0}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={16} />
              {isClearingData ? 'Clearing...' : 'Clear All Data'}
            </button>
          </div>
        </div>
      </div>

      {/* App Information */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Info size={20} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">About</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-2">Statistics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Books:</span>
                  <span className="text-foreground">{books.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed:</span>
                  <span className="text-foreground">
                    {books.filter(book => book.status === 'Completed').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currently Reading:</span>
                  <span className="text-foreground">
                    {books.filter(book => book.status === 'Reading').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To Read:</span>
                  <span className="text-foreground">
                    {books.filter(book => book.status === 'To Read').length}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-2">Features</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Track reading progress</li>
                <li>• Set yearly reading goals</li>
                <li>• View detailed analytics</li>
                <li>• Export/import data</li>
                <li>• Multiple theme options</li>
                <li>• Offline storage</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              Personal Reading List Manager v1.0 - Built with React, TypeScript, and Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;