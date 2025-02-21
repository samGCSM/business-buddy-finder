
import * as XLSX from 'xlsx';
import type { Prospect } from '@/types/prospects';

export const generateSpreadsheet = (prospects: Prospect[]) => {
  try {
    // Transform prospects data for export
    const data = prospects.map(prospect => ({
      'Business Name': prospect.business_name || '',
      'Website': prospect.website || '',
      'Email': prospect.email || '',
      'Address': prospect.business_address || '',
      'Phone': prospect.phone_number || '',
      'Owner Name': prospect.owner_name || '',
      'Status': prospect.status || '',
      'Priority': prospect.priority || '',
      'Territory': prospect.territory || '',
      'Last Contact': prospect.last_contact ? new Date(prospect.last_contact).toLocaleDateString() : '',
      'Rating': prospect.rating || '',
      'Review Count': prospect.review_count || '',
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Prospects');

    // Generate and download file
    XLSX.writeFile(wb, 'prospects_export.xlsx');
  } catch (error) {
    console.error('Error generating spreadsheet:', error);
    throw error;
  }
};
