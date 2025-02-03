import React from 'react';
import Select from 'react-select';

const TimeDropdownComponent = ({ selectedTime, setSelectedTime, availableTimes }) => {
    // Convert availableTimes to react-select format
    const options = availableTimes.map(time => ({
        value: time,
        label: time,
    }));

    return (
        <Select
            options={options}
            value={options.find(option => option.value === selectedTime)}
            onChange={(selectedOption) => setSelectedTime(selectedOption.value)}
            placeholder="Select a time"
            isSearchable={false}
            className="custom-time-dropdown"
        />
    );
};

export default TimeDropdownComponent;
