export const formatDate = (dateString: string | null) => {
  console.log('Formatting date:', dateString);
  if (!dateString) {
    console.log('No date provided');
    return "Never";
  }
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return "Never";
    }
    console.log('Formatted date:', date.toLocaleString());
    return date.toLocaleString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return "Never";
  }
};

export const getNumericValue = (value: number | null | undefined): number => {
  console.log('Getting numeric value:', value);
  if (value === null || value === undefined) {
    console.log('Null or undefined value, returning 0');
    return 0;
  }
  const numValue = Number(value);
  if (isNaN(numValue)) {
    console.log('Invalid number, returning 0');
    return 0;
  }
  console.log('Returning numeric value:', numValue);
  return numValue;
};