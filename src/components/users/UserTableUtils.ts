export const formatDate = (dateString: string | null) => {
  console.log('Formatting date:', dateString);
  if (!dateString) return "Never";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return "Never";
    }
    return date.toLocaleString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return "Never";
  }
};

export const getNumericValue = (value: number | null | undefined): number => {
  console.log('Getting numeric value:', value);
  if (value === null || value === undefined) return 0;
  const numValue = Number(value);
  return isNaN(numValue) ? 0 : numValue;
};