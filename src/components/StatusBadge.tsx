import React from 'react';
import type { Slot } from '../types';

const StatusBadge: React.FC<{ status: Slot['status'] }> = ({ status }) => {
  const colors: Record<Slot['status'], string> = {
    'Open': 'bg-green-100 text-green-700 border-green-200',
    'Booked': 'bg-blue-100 text-blue-700 border-blue-200',
    'Cancelled': 'bg-gray-100 text-gray-500 border-gray-200'
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${colors[status]}`}>
      {status === 'Open' ? '開放' : status === 'Booked' ? '已約' : '取消'}
    </span>
  );
};

export default StatusBadge;
