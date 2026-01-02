import { AlertCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function AssignmentHeader() {
  return (
    <div className="mb-8">
      {/* Title */}
      <div className="mb-6">
        <div className="inline-block px-3 py-1 bg-[#fad200] text-gray-900 rounded-lg mb-3 text-sm">
          《业务公式实现1：建立公式编》
        </div>
        <h1 className="text-gray-900 dark:text-gray-100">作业内容</h1>
      </div>
    </div>
  );
}