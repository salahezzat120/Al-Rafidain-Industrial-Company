import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerProps {
  onChange: (date: Date | [Date, Date] | null) => void;
  placeholderText?: string;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ onChange, placeholderText, className }) => {
  const [startDate, setStartDate] = React.useState<Date | null>(null);

  return (
    <ReactDatePicker
      selected={startDate}
      onChange={(date) => {
        setStartDate(date as Date);
        onChange(date);
      }}
      selectsRange
      startDate={startDate}
      endDate={startDate}
      placeholderText={placeholderText}
      className={className}
    />
  );
};
