import { DashboardKPIs, DailyServiceStats, DashboardFilters } from '@/types/dashboard'
import { format } from 'date-fns'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

interface ExportData {
  kpis: DashboardKPIs
  dailyStats: DailyServiceStats[]
}

export function exportToXLS(data: ExportData, filters: DashboardFilters) {
  // Create workbook
  const wb = XLSX.utils.book_new()

  // KPIs sheet
  const kpisData = [
    ['Métricas de Relatórios'],
    ['Total de Relatórios', data.kpis.reports.total],
    ['Relatórios Publicados', data.kpis.reports.published],
    ['Relatórios em Rascunho', data.kpis.reports.draft],
    ['Tamanho Médio da Equipe', data.kpis.reports.avgTeamSize],
    ['Média de Horas por Serviço', data.kpis.reports.avgServiceHours],
    [''],
    ['Métricas de Presença'],
    ['Taxa Média de Presença', `${data.kpis.attendance.avgRate}%`],
    [''],
    ['Métricas de Aeronaves'],
    ['Total de Aeronaves Atendidas', data.kpis.aircraft.totalServiced],
    ['Média de Serviços por Aeronave', data.kpis.aircraft.avgServicesPerAircraft]
  ]

  const kpisSheet = XLSX.utils.aoa_to_sheet(kpisData)
  XLSX.utils.book_append_sheet(wb, kpisSheet, 'KPIs')

  // Daily stats sheet
  const dailyData = [
    ['Data', 'Total Serviços', 'Limpeza', 'Embarque', 'Aeronaves Únicas', 'Tamanho Médio Equipe'],
    ...data.dailyStats.map(stat => [
      format(new Date(stat.date), 'dd/MM/yyyy'),
      stat.totalServices,
      stat.cleaningServices,
      stat.boardingServices,
      stat.uniqueAircrafts,
      stat.avgTeamSize
    ])
  ]

  const dailySheet = XLSX.utils.aoa_to_sheet(dailyData)
  XLSX.utils.book_append_sheet(wb, dailySheet, 'Dados Diários')

  // Generate filename
  const filename = `dashboard_${format(filters.startDate, 'yyyy-MM')}.xlsx`
  XLSX.writeFile(wb, filename)
}

export function exportToPDF(data: ExportData, filters: DashboardFilters) {
  const doc = new jsPDF()

  // Title
  doc.setFontSize(16)
  doc.text('Relatório Dashboard', 14, 20)
  doc.setFontSize(12)
  doc.text(`Período: ${format(filters.startDate, 'MM/yyyy')}`, 14, 30)

  // KPIs Section
  doc.setFontSize(14)
  doc.text('KPIs', 14, 45)
  doc.setFontSize(10)

  const kpisData = [
    ['Métricas', 'Valor'],
    ['Total de Relatórios', data.kpis.reports.total.toString()],
    ['Relatórios Publicados', data.kpis.reports.published.toString()],
    ['Taxa de Presença', `${data.kpis.attendance.avgRate}%`],
    ['Aeronaves Atendidas', data.kpis.aircraft.totalServiced.toString()],
    ['Tamanho Médio da Equipe', data.kpis.reports.avgTeamSize.toString()]
  ]

  doc.autoTable({
    startY: 50,
    head: [['Métrica', 'Valor']],
    body: kpisData,
    theme: 'grid'
  })

  // Daily Stats Section
  doc.addPage()
  doc.setFontSize(14)
  doc.text('Dados Diários', 14, 20)

  const dailyData = data.dailyStats.map(stat => [
    format(new Date(stat.date), 'dd/MM/yyyy'),
    stat.totalServices,
    stat.cleaningServices,
    stat.boardingServices,
    stat.uniqueAircrafts,
    stat.avgTeamSize.toFixed(2)
  ])

  doc.autoTable({
    startY: 25,
    head: [['Data', 'Total', 'Limpeza', 'Embarque', 'Aeronaves', 'Equipe Média']],
    body: dailyData,
    theme: 'grid'
  })

  // Save PDF
  const filename = `dashboard_${format(filters.startDate, 'yyyy-MM')}.pdf`
  doc.save(filename)
}