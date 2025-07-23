
'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface DatePickerProps {
  date?: Date;
  onDateChange: (date?: Date) => void;
  fromYear: number;
  toYear: number;
  className?: string;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function DatePicker({ date, onDateChange, fromYear, toYear, className }: DatePickerProps) {
  const [day, setDay] = useState<string>(date ? String(date.getDate()) : '');
  const [month, setMonth] = useState<string>(date ? String(date.getMonth()) : '');
  const [year, setYear] = useState<string>(date ? String(date.getFullYear()) : '');

  const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => String(toYear - i));
  
  const daysInMonth = (y: string, m: string) => {
    if (!y || !m) return 31;
    return new Date(Number(y), Number(m) + 1, 0).getDate();
  };

  useEffect(() => {
    const maxDays = daysInMonth(year, month);
    if (Number(day) > maxDays) {
        // If the current day is invalid for the selected month/year,
        // we call onDateChange with undefined to clear the invalid date
        // but we don't reset the day here to avoid a loop.
        // The user must select a new valid day.
        onDateChange(undefined);
    } else if (day && month && year) {
        const newDate = new Date(Number(year), Number(month), Number(day));
        if (!isNaN(newDate.getTime())) {
            onDateChange(newDate);
        }
    } else {
        onDateChange(undefined);
    }
  // This dependency array was incorrect. We need to only react to day, month, year changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, month, year]);


  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      <Select value={day} onValueChange={setDay}>
        <SelectTrigger>
          <SelectValue placeholder="Day" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: daysInMonth(year, month) }, (_, i) => (
            <SelectItem key={i + 1} value={String(i + 1)}>
              {i + 1}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={month} onValueChange={setMonth}>
        <SelectTrigger>
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {months.map((m, i) => (
            <SelectItem key={i} value={String(i)}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={year} onValueChange={setYear}>
        <SelectTrigger>
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map(y => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
