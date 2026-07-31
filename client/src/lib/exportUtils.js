import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

/**
 * Export tabular data to PDF using jsPDF and autoTable
 * @param {Object} options
 * @param {string} options.title - Report title
 * @param {Array<{header: string, key: string}>} options.columns - Table columns
 * @param {Array<Object>} options.data - Data rows
 * @param {string} options.filename - Output filename without extension
 */
export function exportToPDF({ title = 'Reporte de Inventario', columns = [], data = [], filename = 'reporte' }) {
  const doc = new jsPDF()

  // Header branding
  doc.setFillColor(79, 70, 229) // Indigo color #4F46E5
  doc.rect(0, 0, 210, 24, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('TECNOLÓGICO DE SOFTWARE', 14, 12)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Control de Inventarios - Sistema de Gestión', 14, 18)

  // Report Title & Date
  doc.setTextColor(31, 41, 55)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 14, 34)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(107, 114, 128)
  const today = new Date().toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' })
  doc.text(`Fecha de emisión: ${today}`, 14, 40)

  // Prepare table headers and body
  const tableHeaders = columns.map((col) => col.header)
  const tableData = data.map((row) =>
    columns.map((col) => {
      const val = row[col.key]
      if (val === null || val === undefined) return '—'
      if (typeof val === 'number') {
        return val.toLocaleString('es-MX')
      }
      return String(val)
    })
  )

  // AutoTable options
  autoTable(doc, {
    startY: 46,
    head: [tableHeaders],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [55, 65, 81],
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    margin: { left: 14, right: 14 },
  })

  // Save the generated PDF
  doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`)
}

/**
 * Export tabular data to Excel (.xlsx) using SheetJS
 * @param {Object} options
 * @param {string} options.title - Sheet/Report title
 * @param {Array<{header: string, key: string}>} options.columns - Table columns
 * @param {Array<Object>} options.data - Data rows
 * @param {string} options.filename - Output filename without extension
 */
export function exportToExcel({ title = 'Reporte', columns = [], data = [], filename = 'reporte' }) {
  // Convert columns and data to key-value objects for Excel
  const excelData = data.map((row) => {
    const formattedRow = {}
    columns.forEach((col) => {
      const val = row[col.key]
      formattedRow[col.header] = val ?? '—'
    })
    return formattedRow
  })

  const worksheet = XLSX.utils.json_to_sheet(excelData)

  // Auto-fit column width
  const colWidths = columns.map((col) => {
    const maxValLen = data.reduce((max, row) => {
      const val = String(row[col.key] || '')
      return Math.max(max, val.length)
    }, col.header.length)
    return { wch: Math.min(Math.max(maxValLen + 3, 12), 40) }
  })
  worksheet['!cols'] = colWidths

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, title.slice(0, 30))

  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`)
}
