import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { logo } from '../assets/index.js';

function formatDate(date) {
  if (!date) return '-';

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatMonth(month) {
  if (!month) return '-';

  const [year, monthNumber] = month.split('-');
  const parsed = new Date(Number(year), Number(monthNumber) - 1, 1);

  if (Number.isNaN(parsed.getTime())) {
    return month;
  }

  return parsed.toLocaleDateString('en-NG', {
    month: 'long',
    year: 'numeric',
  });
}

function formatTimeRange(startTime, endTime) {
  if (!startTime) return '-';

  return endTime ? `${startTime} - ${endTime}` : startTime;
}

function getFilename(roster, extension) {
  const name =
    (roster?.name || 'roster')
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'roster';

  return `${name}-${roster?.month || 'roster'}.${extension}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildRosterRows(roster) {
  const rows = [];

  for (const occurrence of roster?.occurrences || []) {
    const assignments = occurrence.assignments || [];

    if (!assignments.length) {
      rows.push({
        date: formatDate(occurrence.date),
        duty: occurrence.eventName || '-',
        time: formatTimeRange(occurrence.startTime, occurrence.endTime),
        member: 'No member assigned',
        role: '',
      });

      continue;
    }

    assignments.forEach((assignment, index) => {
      rows.push({
        date: index === 0 ? formatDate(occurrence.date) : '',
        duty: index === 0 ? occurrence.eventName || '-' : '',
        time:
          index === 0
            ? formatTimeRange(occurrence.startTime, occurrence.endTime)
            : '',
        member: assignment.member?.fullName || 'Unknown member',
        role: assignment.roleName || '',
      });
    });
  }

  return rows;
}

function buildRosterExportHtml(roster, departmentName) {
  const rows = buildRosterRows(roster);

  const tableRows = rows.length
    ? rows
        .map(
          (row) => `
            <tr>
              <td style="${cellStyle}">
                ${escapeHtml(row.date)}
              </td>

              <td style="${cellStyle}">
                ${escapeHtml(row.duty)}
              </td>

              <td style="${cellStyle}">
                ${escapeHtml(row.time)}
              </td>

              <td style="${cellStyle} font-weight: 600;">
                ${escapeHtml(row.member)}
              </td>

              <td style="${cellStyle}">
                ${escapeHtml(row.role)}
              </td>
            </tr>
          `,
        )
        .join('')
    : `
        <tr>
          <td
            colspan="5"
            style="${cellStyle} text-align: center; padding: 25px;"
          >
            No roster assignments
          </td>
        </tr>
      `;

  return `
    <div
      style="
        text-align: center;
        margin-bottom: 32px;
      "
    >
      <img
        src="${logo}"
        alt="Dominion City"
        style="
          width: 90px;
          height: 90px;
          object-fit: contain;
          display: block;
          margin: 0 auto 18px;
        "
      />

      <div
        style="
          font-size: 28px;
          font-weight: 700;
          letter-spacing: 0.5px;
        "
      >
        DOMINION CITY
      </div>

      <div
        style="
          font-size: 16px;
          margin-top: 3px;
        "
      >
        Department Portal
      </div>

      <div
        style="
          font-size: 14px;
          margin-top: 3px;
        "
      >
        Asaba HQ
      </div>

      <div
        style="
          font-size: 17px;
          font-weight: 700;
          margin-top: 16px;
        "
      >
        ${escapeHtml(departmentName || 'Department')}
      </div>

      <div
        style="
          font-size: 23px;
          font-weight: 700;
          margin-top: 28px;
        "
      >
        ${escapeHtml(roster?.name || 'Roster')}
      </div>

      <div
        style="
          font-size: 17px;
          margin-top: 6px;
        "
      >
        ${escapeHtml(formatMonth(roster?.month))}
      </div>
    </div>

    <div
      style="
        display: flex;
        justify-content: space-between;
        margin-bottom: 18px;
        font-size: 14px;
      "
    >
      <div>
        <strong>Status:</strong>
        Published
      </div>

      <div>
        <strong>Assignments:</strong>
        ${rows.length}
      </div>
    </div>

    <table
      style="
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
      "
    >
      <thead>
        <tr>
          <th style="${headerStyle} text-align: left;">
            Date
          </th>

          <th style="${headerStyle} text-align: left;">
            Duty
          </th>

          <th style="${headerStyle} text-align: left;">
            Time
          </th>

          <th style="${headerStyle} text-align: left;">
            Member
          </th>

          <th style="${headerStyle} text-align: left;">
            Role
          </th>
        </tr>
      </thead>

      <tbody>
        ${tableRows}
      </tbody>
    </table>

    <div
      style="
        text-align: center;
        margin-top: 30px;
        font-size: 12px;
        color: #6b7280;
      "
    >
      Dominion City Department Portal
      <br />
      Generated on ${new Date().toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}
    </div>
  `;
}

export async function exportRosterImage(roster, departmentName) {
  const container = document.createElement('div');

  container.style.position = 'fixed';
  container.style.left = '-10000px';
  container.style.top = '0';
  container.style.width = '1100px';
  container.style.padding = '50px';
  container.style.background = '#ffffff';
  container.style.color = '#111827';
  container.style.fontFamily = 'Arial, Helvetica, sans-serif';
  container.style.boxSizing = 'border-box';

  container.innerHTML = buildRosterExportHtml(roster, departmentName);

  document.body.appendChild(container);

  try {
    const image = container.querySelector('img');

    if (image) {
      await new Promise((resolve) => {
        if (image.complete) {
          resolve();
          return;
        }

        image.onload = resolve;
        image.onerror = resolve;
      });
    }

    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
    });

    const link = document.createElement('a');

    link.download = getFilename(roster, 'png');

    link.href = canvas.toDataURL('image/png');

    link.click();
  } finally {
    document.body.removeChild(container);
  }
}

export async function exportRosterPdf(roster, departmentName) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  const pageHeight = doc.internal.pageSize.getHeight();

  try {
    const logoData = await loadImageAsDataUrl(logo);
    const imageFormat = getImageFormat(logoData);

    const logoSize = 22;

    doc.addImage(
      logoData,
      imageFormat,
      (pageWidth - logoSize) / 2,
      8,
      logoSize,
      logoSize,
    );
  } catch (error) {
    console.error('Failed to load roster PDF logo:', error);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);

  doc.text('DOMINION CITY', pageWidth / 2, 38, {
    align: 'center',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  doc.text('Department Portal', pageWidth / 2, 43, {
    align: 'center',
  });

  doc.text('Asaba HQ', pageWidth / 2, 47, {
    align: 'center',
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);

  doc.text(departmentName || 'Department', pageWidth / 2, 54, {
    align: 'center',
  });

  doc.setFontSize(14);

  doc.text(roster?.name || 'Roster', pageWidth / 2, 63, {
    align: 'center',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  doc.text(formatMonth(roster?.month), pageWidth / 2, 69, {
    align: 'center',
  });

  const rows = buildRosterRows(roster);

  const tableRows = rows.map((row) => [
    row.date,
    row.duty,
    row.time,
    row.member,
    row.role,
  ]);

  autoTable(doc, {
    startY: 77,

    margin: {
      left: 12,
      right: 12,
    },

    head: [['Date', 'Duty', 'Time', 'Member', 'Role']],

    body: tableRows,

    styles: {
      fontSize: 8.5,
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
        cellWidth: 30,
      },
      1: {
        cellWidth: 55,
      },
      2: {
        cellWidth: 38,
      },
      3: {
        cellWidth: 70,
      },
      4: {
        cellWidth: 70,
      },
    },

    didDrawPage: () => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');

      doc.text(
        'Dominion City Department Portal',
        pageWidth / 2,
        pageHeight - 10,
        {
          align: 'center',
        },
      );

      doc.text(
        `Generated on ${new Date().toLocaleDateString('en-NG', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}`,
        pageWidth / 2,
        pageHeight - 5,
        {
          align: 'center',
        },
      );
    },
  });

  doc.save(getFilename(roster, 'pdf'));
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

const headerStyle = `
  background: rgb(0, 54, 154);
  color: #ffffff;
  padding: 12px 10px;
  font-weight: 700;
`;

const cellStyle = `
  border: 1px solid #d1d5db;
  padding: 10px;
  vertical-align: middle;
`;
