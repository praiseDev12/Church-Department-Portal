import html2canvas from 'html2canvas';

import { logo } from '../assets/index.js';

function formatAmount(amount) {
  return `₦${Number(amount || 0).toLocaleString('en-NG', {
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

export async function exportContributionImage(contribution) {
  const entries = contribution.entries || [];

  const totalAmount = Number(contribution.totalAmount || 0);

  const container = document.createElement('div');

  container.style.position = 'fixed';
  container.style.left = '-10000px';
  container.style.top = '0';
  container.style.width = '900px';
  container.style.padding = '50px';
  container.style.background = '#ffffff';
  container.style.color = '#111827';
  container.style.fontFamily = 'Arial, Helvetica, sans-serif';
  container.style.boxSizing = 'border-box';

  container.innerHTML = `
    <div style="
      text-align: center;
      margin-bottom: 32px;
    ">
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

      <div style="
        font-size: 28px;
        font-weight: 700;
        letter-spacing: 0.5px;
      ">
        DOMINION CITY
      </div>

      <div style="
        font-size: 16px;
        margin-top: 3px;
      ">
        Department Portal
      </div>

      <div style="
        font-size: 14px;
        margin-top: 3px;
      ">
        Asaba HQ
      </div>

      <div style="
        font-size: 23px;
        font-weight: 700;
        margin-top: 28px;
      ">
        ${escapeHtml(contribution.title || 'Contribution Record')}
      </div>
    </div>

    <div style="
      display: flex;
      justify-content: space-between;
      margin-bottom: 18px;
      font-size: 14px;
    ">
      <div>
        <strong>Recorded:</strong>
        ${formatDate(contribution.createdAt)}
      </div>

      <div>
        <strong>Contributors:</strong>
        ${entries.length}
      </div>
    </div>

    <table style="
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    ">
      <thead>
        <tr>
          <th style="${headerStyle} text-align: left;">
            Member
          </th>

          <th style="${headerStyle} text-align: right;">
            Amount
          </th>

          <th style="${headerStyle} text-align: left;">
            Contribution Date
          </th>

          <th style="${headerStyle} text-align: left;">
            Recorded
          </th>
        </tr>
      </thead>

      <tbody>
        ${
          entries.length
            ? entries
                .map(
                  (entry) => `
                    <tr>
                      <td style="${cellStyle}">
                        ${escapeHtml(
                          entry.member?.fullName || 'Unknown member',
                        )}
                      </td>

                      <td style="${cellStyle} text-align: right; font-weight: 600;">
                        ${formatAmount(entry.amount)}
                      </td>

                      <td style="${cellStyle}">
                        ${formatDate(entry.contributedAt)}
                      </td>

                      <td style="${cellStyle}">
                        ${formatDate(entry.createdAt)}
                      </td>
                    </tr>
                  `,
                )
                .join('')
            : `
              <tr>
                <td
                  colspan="4"
                  style="${cellStyle} text-align: center; padding: 25px;"
                >
                  No contributions recorded
                </td>
              </tr>
            `
        }
      </tbody>
    </table>

    <div style="
      margin-top: 24px;
      border: 1px solid #b4b4b4;
      padding: 18px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    ">
      <div style="
        font-size: 14px;
        font-weight: 600;
      ">
        TOTAL CONTRIBUTION
      </div>

      <div style="
        font-size: 20px;
        font-weight: 700;
      ">
        ${formatAmount(totalAmount)}
      </div>
    </div>

    <div style="
      text-align: center;
      margin-top: 30px;
      font-size: 12px;
      color: #6b7280;
    ">
      Dominion City Department Portal
      <br />
      Generated on ${formatDate(new Date())}
    </div>
  `;

  document.body.appendChild(container);

  try {
    // Wait for the logo to finish loading before capturing
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

    const filename =
      (contribution.title || 'contribution-record')
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase() || 'contribution-record';

    const link = document.createElement('a');

    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');

    link.click();
  } finally {
    document.body.removeChild(container);
  }
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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
