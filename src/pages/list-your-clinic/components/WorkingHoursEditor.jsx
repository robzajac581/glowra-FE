import React from 'react';
import { DAYS_OF_WEEK, generateTimeOptions } from '../constants';

const WorkingHoursEditor = ({ workingHours = {}, onChange }) => {
  const timeOptions = generateTimeOptions();

  const updateDay = (day, field, value) => {
    const dayData = workingHours[day] || { open: '', close: '', closed: false };
    const updated = { ...dayData, [field]: value };
    
    // If marking as closed, clear times
    if (field === 'closed' && value) {
      updated.open = '';
      updated.close = '';
    }
    
    onChange({
      ...workingHours,
      [day]: updated
    });
  };

  const formatForDisplay = (day) => {
    const dayData = workingHours[day];
    if (!dayData || dayData.closed) return 'Closed';
    if (!dayData.open || !dayData.close) return '';
    
    // Convert 24h format to display format
    const formatTime = (timeStr) => {
      const [hour, minute] = timeStr.split(':').map(Number);
      const h = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour < 12 ? 'AM' : 'PM';
      return `${h}:${minute.toString().padStart(2, '0')}${ampm}`;
    };
    
    return `${formatTime(dayData.open)}-${formatTime(dayData.close)}`;
  };

  return (
    <div className="space-y-3">
      {DAYS_OF_WEEK.map((day) => {
        const dayData = workingHours[day] || { open: '', close: '', closed: false };
        
        return (
          <div key={day} className="grid grid-cols-[100px_1fr_auto] gap-3 items-center">
            <div className="text-sm font-medium">{day}</div>
            
            {!dayData.closed ? (
              <div className="flex items-center gap-2">
                <select
                  value={dayData.open || ''}
                  onChange={(e) => updateDay(day, 'open', e.target.value)}
                  className="px-3 py-1.5 border border-border rounded text-sm focus:outline-none focus:border-primary"
                >
                  <option value="">Open</option>
                  {timeOptions.map((time) => (
                    <option key={time.value} value={time.value}>
                      {time.display}
                    </option>
                  ))}
                </select>
                <span className="text-sm">-</span>
                <select
                  value={dayData.close || ''}
                  onChange={(e) => updateDay(day, 'close', e.target.value)}
                  className="px-3 py-1.5 border border-border rounded text-sm focus:outline-none focus:border-primary"
                >
                  <option value="">Close</option>
                  {timeOptions.map((time) => (
                    <option key={time.value} value={time.value}>
                      {time.display}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="text-sm text-text italic">Closed</div>
            )}
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dayData.closed || false}
                onChange={(e) => updateDay(day, 'closed', e.target.checked)}
                className="cursor-pointer"
              />
              <span className="text-sm text-text">Closed</span>
            </label>
          </div>
        );
      })}
    </div>
  );
};

export default WorkingHoursEditor;

