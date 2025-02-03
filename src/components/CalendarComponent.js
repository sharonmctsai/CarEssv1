import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CalendarComponent = ({ selectedDate, setSelectedDate }) => {
  return (
    <div>
      <h5>Select a Date</h5>
      <DatePicker
        selected={selectedDate ? new Date(selectedDate) : null}
        onChange={(date) => setSelectedDate(date.toISOString().split('T')[0])}
        dateFormat="yyyy-MM-dd"
        minDate={new Date()} // Disable past dates
        className="custom-datepicker"
      />
    </div>
  );
};

export default CalendarComponent;
