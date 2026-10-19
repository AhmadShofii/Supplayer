export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const processCell = (cell: string | number) => {
    if (cell === null || cell === undefined) return '""';
    const cellStr = String(cell).replace(/"/g, '""');
    return `"${cellStr}"`;
  };

  const csvContent =
    '\uFEFF' + // UTF-8 BOM for Indonesian Excel
    [headers.map(processCell).join(';'), ...rows.map((row) => row.map(processCell).join(';'))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
