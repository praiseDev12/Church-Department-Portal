import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { logo } from '../assets/index.js';

function formatAmount(amount) {
  return `NGN ${Number(amount || 0).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(date) {
  if (!date) return '-';

  return new Date(date).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

async function loadImageAsDataUrl(src) {
  const response = await fetch(src);
  const blob = await response.blob();

  const objectUrl = URL.createObjectURL(blob);

  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => resolve(img);
      img.onerror = reject;

      img.src = objectUrl;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    // White background prevents transparency artifacts in the PDF
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(image, 0, 0);

    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function getImageFormat(dataUrl) {
  if (dataUrl.startsWith('data:image/png')) {
    return 'PNG';
  }

  if (
    dataUrl.startsWith('data:image/jpeg') ||
    dataUrl.startsWith('data:image/jpg')
  ) {
    return 'JPEG';
  }

  return 'PNG';
}

export async function exportContributionPdf(contribution) {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  /*
   * ─────────────────────────────────────
   * Logo
   * ─────────────────────────────────────
   */

  try {
    const logoData = await loadImageAsDataUrl(logo);
    const imageFormat = getImageFormat(logoData);

    const logoSize = 25;

    doc.addImage(
      logoData,
      imageFormat,
      (pageWidth - logoSize) / 2,
      10,
      logoSize,
      logoSize,
    );
  } catch (error) {
    console.error('Failed to load contribution PDF logo:', error);
  }

  /*
   * ─────────────────────────────────────
   * Header
   * ─────────────────────────────────────
   */

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);

  doc.text('DOMINION CITY', pageWidth / 2, 43, {
    align: 'center',
  });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  doc.text('Department Portal', pageWidth / 2, 47, {
    align: 'center',
  });

  doc.text('Asaba HQ', pageWidth / 2, 50, {
    align: 'center',
  });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');

  doc.text(contribution.title || 'Contribution Record', pageWidth / 2, 63, {
    align: 'center',
  });

  /*
   * ─────────────────────────────────────
   * Summary
   * ─────────────────────────────────────
   */

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  doc.text(`Recorded: ${formatDate(contribution.createdAt)}`, 14, 76);

  doc.text(`Contributors: ${contribution.entries?.length || 0}`, 14, 83);

  /*
   * ─────────────────────────────────────
   * Entries table
   * ─────────────────────────────────────
   */

  const rows = (contribution.entries || []).map((entry) => [
    entry.member?.fullName || 'Unknown member',
    formatAmount(entry.amount),
    formatDate(entry.contributedAt),
    formatDate(entry.createdAt),
  ]);

  autoTable(doc, {
    startY: 92,

    margin: {
      left: 14,
      right: 14,
    },

    head: [['Member', 'Amount', 'Contribution Date', 'Recorded']],

    body: rows,

    styles: {
      fontSize: 9,
      cellPadding: 3,
      valign: 'middle',
    },

    headStyles: {
      fillColor: [0, 54, 154],
      textColor: 255,
      fontStyle: 'bold',
    },

    columnStyles: {
      0: {
        cellWidth: 62,
      },
      1: {
        cellWidth: 38,
      },
      2: {
        cellWidth: 42,
      },
      3: {
        cellWidth: 40,
      },
    },

    didDrawPage: () => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');

      doc.text(
        `Generated on ${formatDate(new Date())}`,
        pageWidth / 2,
        pageHeight - 10,
        {
          align: 'center',
        },
      );
    },
  });

  /*
   * ─────────────────────────────────────
   * Total
   * ─────────────────────────────────────
   */

  const finalY = doc.lastAutoTable.finalY + 10;

  const totalBoxHeight = 18;
  const totalBoxWidth = 80;
  const totalBoxX = pageWidth - 14 - totalBoxWidth;

  doc.setDrawColor(180, 180, 180);
  doc.rect(totalBoxX, finalY, totalBoxWidth, totalBoxHeight);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  doc.text('TOTAL CONTRIBUTION', totalBoxX + 5, finalY + 7);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');

  doc.text(
    formatAmount(contribution.totalAmount),
    totalBoxX + totalBoxWidth - 5,
    finalY + 13,
    {
      align: 'right',
    },
  );

  /*
   * ─────────────────────────────────────
   * Footer
   * ─────────────────────────────────────
   */

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  doc.text('Dominion City Department Portal', pageWidth / 2, pageHeight - 18, {
    align: 'center',
  });

  /*
   * ─────────────────────────────────────
   * Save
   * ─────────────────────────────────────
   */

  const filename =
    (contribution.title || 'contribution-record')
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'contribution-record';

  doc.save(`${filename}.pdf`);
}
