import React from 'react';
import { Settings } from 'lucide-react';

interface HeaderProps { onSettingsClick: () => void; }

const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  return (
    <header className="fixed top-0 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50 px-4 h-16 flex items-center justify-between shadow-sm">
      <h1 className="text-xl font-bold text-indigo-600">Simple Budget</h1>
      <button onClick={onSettingsClick} className="p-2 text-gray-600"><Settings /></button>
    </header>
  );
};
export default Header;