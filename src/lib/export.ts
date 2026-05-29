import * as XLSX from 'xlsx'
import type { Estimate } from '../types'
import { rowTotal, sectionTotal, estimateTotals } from './calc'

export function exportEstimateXlsx(e: Estimate) {
  const wb = XLSX.utils.book_new()

  // Сводная
  const summary: any[][] = [
    ['Смета', e.title],
    ['Клиент', e.client],
    ['Мероприятие', e.event],
    ['Период', e.dateRange],
    [],
    ['№', 'Раздел', 'Сумма, ₽'],
  ]
  e.rooms.forEach((r, i) => {
    const rt = r.sections.reduce((s, sec) => s + sectionTotal(sec.rows), 0)
    summary.push([i + 1, r.name, rt])
  })
  const totals = estimateTotals(e)
  summary.push([])
  summary.push(['Без НДС', '', totals.net])
  summary.push(['УСН 5%', '', totals.usn5])
  summary.push(['НДС 22%', '', totals.vat22])
  const ws = XLSX.utils.aoa_to_sheet(summary)
  ws['!cols'] = [{ wch: 6 }, { wch: 40 }, { wch: 18 }]
  XLSX.utils.book_append_sheet(wb, ws, 'Сводная')

  e.rooms.forEach((room) => {
    const data: any[][] = [
      ['№', 'Наименование', 'Ед.', 'Кол-во', 'Цена за 1 день, ₽', 'Дней', 'Коэф.', 'Сумма, ₽', 'Комментарий'],
    ]
    let n = 1
    room.sections.forEach((sec) => {
      data.push([`№ ${n++}  ${sec.name}`])
      sec.rows.forEach((r, i) => {
        data.push([i + 1, r.name, r.unit, r.qty, r.price, r.days, r.coef, rowTotal(r), r.comment || ''])
      })
      data.push(['', `Итого: ${sec.name}`, '', '', '', '', '', sectionTotal(sec.rows)])
      data.push([])
    })
    const sheet = XLSX.utils.aoa_to_sheet(data)
    sheet['!cols'] = [
      { wch: 5 },
      { wch: 48 },
      { wch: 8 },
      { wch: 8 },
      { wch: 14 },
      { wch: 7 },
      { wch: 7 },
      { wch: 14 },
      { wch: 24 },
    ]
    const sheetName = room.name.slice(0, 31).replace(/[\\/?*\[\]]/g, '_')
    XLSX.utils.book_append_sheet(wb, sheet, sheetName || 'Лист')
  })

  const fname = `${e.title.replace(/[\\/:*?"<>|]/g, '_')}.xlsx`
  XLSX.writeFile(wb, fname)
}

export function exportEstimateJson(e: Estimate) {
  const blob = new Blob([JSON.stringify(e, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${e.title}.json`
  a.click()
  URL.revokeObjectURL(url)
}
