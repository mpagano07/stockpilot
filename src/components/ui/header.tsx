import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export function Header() {
  return (
    <header className={cn('flex h-14 items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4')}>
      <div className="flex items-center space-x-2">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">StockPilot</h1>
      </div>
      <div className="flex items-center space-x-4">
        {/* Placeholder for user avatar */}
        <button className="rounded-full w-8 h-8 bg-gray-300 dark:bg-gray-600 focus:outline-none" aria-label="User profile" />
      </div>
    </header>
  );
}
