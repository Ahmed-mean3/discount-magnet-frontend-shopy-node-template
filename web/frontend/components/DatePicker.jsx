import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Popover,
  TextField,
  Card,
  DatePicker,
  Icon,
  LegacyStack,
} from "@shopify/polaris";
import { CalendarMinor } from "@shopify/polaris-icons";

export default function DatePickerMain({
  label = "Start date",
  initialDate = new Date(),
  onDateChange,
}) {
  const [visible, setVisible] = useState(false);

  // Ensure initialDate is a valid Date object
  const validDate = initialDate instanceof Date ? initialDate : new Date();

  // Set the initial date and calculate month/year
  const [selectedDate, setSelectedDate] = useState(validDate);

  const [{ month, year }, setDate] = useState({
    month: validDate.getMonth(),
    year: validDate.getFullYear(),
  });

  const formattedValue = selectedDate.toISOString().slice(0, 10);
  const datePickerRef = useRef(null);

  function nodeContainsDescendant(rootNode, descendant) {
    if (rootNode === descendant) return true;
    let parent = descendant.parentNode;
    while (parent != null) {
      if (parent === rootNode) return true;
      parent = parent.parentNode;
    }
    return false;
  }

  function handleInputValueChange() {
    // Triggered when the text field changes
  }

  function handleOnClose() {
    setVisible(false);
  }

  function handleMonthChange(newMonth, newYear) {
    // Adjust for month overflow and underflow
    const maxDaysInMonth = new Date(newYear, newMonth + 1, 0).getDate();
    let newDay = selectedDate.getDate();

    // If the selected day exceeds the number of days in the new month, adjust it
    if (newDay > maxDaysInMonth) {
      newDay = maxDaysInMonth;
    }

    // Set the new date with adjusted day
    setSelectedDate(new Date(newYear, newMonth, newDay));
    setDate({ month: newMonth, year: newYear });
  }

  function handleDateSelection({ end: newSelectedDate }) {
    setSelectedDate(newSelectedDate);
    setVisible(false);
    if (onDateChange) {
      onDateChange(newSelectedDate);
    }
  }

  useEffect(() => {
    if (selectedDate) {
      setDate({
        month: selectedDate.getMonth(),
        year: selectedDate.getFullYear(),
      });
    }
  }, [selectedDate]);

  return (
    <LegacyStack inlineAlign="center" gap="400">
      <Box minWidth="276px" padding={{ xs: 200 }}>
        <Popover
          active={visible}
          autofocusTarget="none"
          preferredAlignment="left"
          fullWidth
          preferInputActivator={false}
          preferredPosition="below"
          preventCloseOnChildOverlayClick
          onClose={handleOnClose}
          activator={
            <TextField
              role="combobox"
              label={label}
              prefix={<Icon source={CalendarMinor} />}
              value={formattedValue}
              onFocus={() => setVisible(true)}
              onChange={handleInputValueChange}
              autoComplete="off"
            />
          }
        >
          <Card ref={datePickerRef}>
            <DatePicker
              month={month}
              year={year}
              selected={selectedDate}
              onMonthChange={handleMonthChange}
              onChange={handleDateSelection}
            />
          </Card>
        </Popover>
      </Box>
    </LegacyStack>
  );
}
