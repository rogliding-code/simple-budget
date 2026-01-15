import React from 'react';
import { LayoutGrid, Calculator, History } from 'lucide-react';
import clsx from 'clsx';

const BottomNav = ({ currentView, setView }: any) => {
  const navItems = [
    { id: 'dashboard', label: 'Panel', icon: LayoutGrid },
    { id: 'budget', label: 'Presupuesto', icon: Calculator },
    { id: 'history', label: 'Historial', icon: History },
  ];
  return (
    <nav className="fixed bottom-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 px-6 h-20 flex justify-between items-start z-50">
      {navItems.map((item) => (
        <button key={item.id} onClick={() => setView(item.id)} className={clsx("flex flex-col items-center w-16 pt-2", currentView === item.id ? "text-indigo-600" : "text-gray-400")}>
          <item.icon className="w-6 h-6" />
          <span className="text-xs font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
export default BottomNav;