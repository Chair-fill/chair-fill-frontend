import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Capture an HTML element and download it as a high-quality PDF.
 * @param elementId The ID of the container element to capture.
 * @param filename The name of the resulting PDF file.
 */
export async function exportToPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Use a slight delay to ensure all animations/renders are complete
  await new Promise(resolve => setTimeout(resolve, 100));

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Double resolution for crisp text/charts
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    throw error;
  }
}
