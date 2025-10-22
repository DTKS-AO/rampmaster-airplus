import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'jspdf-autotable';

interface GenerateReportPDFOptions {
  showLogo?: boolean;
  imageQuality?: number;
}

export async function generateReportPDF(report: any, options: GenerateReportPDFOptions = {}) {
  const { showLogo = true, imageQuality = 0.8 } = options;
  
  // Create PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Helper for text alignment
  const centerX = doc.internal.pageSize.width / 2;

  // Add header with logo
  if (showLogo) {
    // TODO: Add company logo
    // doc.addImage('logo.png', 'PNG', 20, 10, 40, 20);
  }

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Serviço', centerX, 25, { align: 'center' });

  // Service info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  const serviceType = report.service_type === 'cleaning' ? 'Limpeza' : 'Embarque/Desembarque';
  const formattedDate = format(new Date(report.service_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  
  let y = 40;
  const col1X = 20;
  const col2X = 110;

  // Basic info table
  doc.setFont('helvetica', 'bold');
  doc.text('Informações do Serviço', col1X, y);
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.text(`Tipo de Serviço: ${serviceType}`, col1X, y);
  doc.text(`Data: ${formattedDate}`, col2X, y);
  y += 7;
  doc.text(`Aeronave: ${report.aircraft?.registration}`, col1X, y);
  doc.text(`Cliente: ${report.client?.name}`, col2X, y);
  y += 7;
  doc.text(`Turno: ${report.shift?.name}`, col1X, y);
  y += 15;

  // Team table
  doc.setFont('helvetica', 'bold');
  doc.text('Equipe', col1X, y);
  y += 7;

  // @ts-ignore
  doc.autoTable({
    startY: y,
    head: [['Nome', 'Função', 'Horas']],
    body: report.report_employees?.map((emp: any) => [
      emp.employee?.name,
      emp.role === 'supervisor' ? 'Supervisor' : emp.role === 'tecnico' ? 'Técnico' : 'Auxiliar',
      `${emp.hours_worked}h`,
    ]) || [],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [66, 66, 66] },
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // Photos section
  doc.setFont('helvetica', 'bold');
  doc.text('Registro Fotográfico', col1X, y);
  y += 10;

  // Function to load and resize image
  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  };

  // Add before photos
  doc.setFont('helvetica', 'normal');
  doc.text('Antes do Serviço:', col1X, y);
  y += 7;

  const beforePhotos = report.report_photos?.filter((p: any) => p.tipo === 'antes') || [];
  const afterPhotos = report.report_photos?.filter((p: any) => p.tipo === 'depois') || [];

  // Calculate photo dimensions
  const photoWidth = 50;
  const photoHeight = 35;
  const photosPerRow = 3;
  const photoSpacing = 5;

  // Helper to add photo row
  const addPhotoRow = async (photos: any[], startY: number) => {
    let x = col1X;
    for (const photo of photos) {
      try {
        const img = await loadImage(photo.url);
        doc.addImage(
          img,
          'JPEG',
          x,
          startY,
          photoWidth,
          photoHeight,
          undefined,
          'MEDIUM',
          0
        );
        x += photoWidth + photoSpacing;
      } catch (error) {
        console.error('Error loading photo:', error);
      }
    }
    return startY + photoHeight + photoSpacing;
  };

  // Add photos in groups of 3
  for (let i = 0; i < beforePhotos.length; i += photosPerRow) {
    const row = beforePhotos.slice(i, i + photosPerRow);
    y = await addPhotoRow(row, y);
  }

  y += 5;
  doc.text('Depois do Serviço:', col1X, y);
  y += 7;

  for (let i = 0; i < afterPhotos.length; i += photosPerRow) {
    const row = afterPhotos.slice(i, i + photosPerRow);
    y = await addPhotoRow(row, y);
  }

  // Add new page for signatures
  doc.addPage();
  y = 20;

  // Signatures section
  doc.setFont('helvetica', 'bold');
  doc.text('Assinaturas', col1X, y);
  y += 10;

  // Add signatures
  for (const signature of report.report_signatures || []) {
    doc.setFont('helvetica', 'normal');
    doc.text(signature.nome, col1X, y);
    doc.text(signature.cargo, col1X, y + 5);
    
    try {
      const img = await loadImage(signature.assinatura_url);
      doc.addImage(
        img,
        'PNG',
        col1X,
        y + 10,
        80,
        30,
        undefined,
        'MEDIUM',
        0
      );
    } catch (error) {
      console.error('Error loading signature:', error);
    }
    
    y += 50;
  }

  // Add footer with page numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width - 20,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    );
  }

  // Save the PDF
  doc.save(`relatorio-${report.id}.pdf`);
}