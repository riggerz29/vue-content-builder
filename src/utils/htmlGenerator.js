/**
 * Generate production-ready HTML email with inline styles
 */
export function generateHTML(blocks, bodySettings) {
    const contentHtml = blocks.map(block => generateBlockHTML(block)).join('\n')
    const preheaderHtml = bodySettings.preheaderText ? `
  <!-- Preheader Text -->
  <div style="display: none; max-height: 0px; overflow: hidden;">
    ${escapeHtml(bodySettings.preheaderText)}
  </div>
  <!-- End Preheader -->` : ''

    const contentAlignment = bodySettings.contentAlignment || 'center'

    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Email</title>
  <style type="text/css">
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    a { color: ${bodySettings.linkColor || '#2f4574'}; text-decoration: underline; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${bodySettings.backgroundColor}; font-family: ${bodySettings.fontFamily}; font-weight: ${bodySettings.fontWeight || 'normal'}; color: ${bodySettings.textColor || '#000000'};">
  ${preheaderHtml}
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${bodySettings.backgroundColor};">
    <tr>
      <td align="${contentAlignment}" style="padding: 20px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="${bodySettings.contentWidth}" style="max-width: ${bodySettings.contentWidth}px; background-color: #ffffff;">
          <tr>
            <td style="font-family: ${bodySettings.fontFamily}; font-weight: ${bodySettings.fontWeight || 'normal'}; color: ${bodySettings.textColor || '#000000'};">
              ${contentHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function generateBlockHTML(block) {
    switch (block.type) {
        case 'button':
            return generateButtonHTML(block)
        case 'divider':
            return generateDividerHTML(block)
        case 'heading':
            return generateHeadingHTML(block)
        case 'paragraph':
            return generateParagraphHTML(block)
        case 'image':
            return generateImageHTML(block)
        case 'video':
            return generateVideoHTML(block)
        case 'social':
            return generateSocialHTML(block)
        case 'table':
            return generateTableHTML(block)
        case 'row':
            return generateRowHTML(block)
        default:
            return ''
    }
}

function generateButtonHTML(block) {
    const p = block.properties
    const margin = `${p.margin.top}px ${p.margin.right}px ${p.margin.bottom}px ${p.margin.left}px`
    const padding = `${p.padding.top}px ${p.padding.right}px ${p.padding.bottom}px ${p.padding.left}px`

    return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: ${margin};">
      <tr>
        <td align="${p.align}">
          <table border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="border-radius: ${p.borderRadius}px; background-color: ${p.backgroundColor};">
                <a href="${p.url}" target="_blank" style="display: inline-block; padding: ${padding}; font-family: ${p.fontFamily}; font-size: ${p.fontSize}px; font-weight: ${p.fontWeight}; color: ${p.textColor}; text-decoration: ${p.textDecoration}; border-radius: ${p.borderRadius}px;">
                  ${p.text}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

function generateDividerHTML(block) {
    const p = block.properties
    const margin = `${p.margin.top}px ${p.margin.right}px ${p.margin.bottom}px ${p.margin.left}px`

    return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: ${margin};">
      <tr>
        <td align="${p.align}">
          <table border="0" cellpadding="0" cellspacing="0" width="${p.width}%">
            <tr>
              <td style="border-top: ${p.height}px solid ${p.color};"></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

function generateHeadingHTML(block) {
    const p = block.properties
    const margin = `${p.margin.top}px ${p.margin.right}px ${p.margin.bottom}px ${p.margin.left}px`
    const padding = `${p.padding.top}px ${p.padding.right}px ${p.padding.bottom}px ${p.padding.left}px`

    return `
    <${p.level} style="margin: ${margin}; padding: ${padding}; font-family: ${p.fontFamily}; font-size: ${p.fontSize}px; font-weight: ${p.fontWeight}; color: ${p.color}; line-height: ${p.lineHeight}; letter-spacing: ${p.letterSpacing}px; text-align: ${p.align};">
      ${p.text}
    </${p.level}>`
}

function generateParagraphHTML(block) {
    const p = block.properties
    const margin = `${p.margin.top}px ${p.margin.right}px ${p.margin.bottom}px ${p.margin.left}px`
    const padding = `${p.padding.top}px ${p.padding.right}px ${p.padding.bottom}px ${p.padding.left}px`

    return `
    <p style="margin: ${margin}; padding: ${padding}; font-family: ${p.fontFamily}; font-size: ${p.fontSize}px; font-weight: ${p.fontWeight}; color: ${p.color}; line-height: ${p.lineHeight}; letter-spacing: ${p.letterSpacing}px; text-align: ${p.align};">
      ${p.text}
    </p>`
}

function generateImageHTML(block) {
    const p = block.properties
    const margin = `${p.margin.top}px ${p.margin.right}px ${p.margin.bottom}px ${p.margin.left}px`

    const imgTag = `<img src="${p.url}" alt="${escapeHtml(p.alt)}" width="${p.width}" height="${p.height}" style="display: block; max-width: 100%; height: auto;" />`

    const content = p.link ? `<a href="${p.link}" target="_blank">${imgTag}</a>` : imgTag

    return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: ${margin};">
      <tr>
        <td align="${p.align}">
          ${content}
        </td>
      </tr>
    </table>`
}

function generateVideoHTML(block) {
    const p = block.properties
    const margin = `${p.margin.top}px ${p.margin.right}px ${p.margin.bottom}px ${p.margin.left}px`

    return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: ${margin};">
      <tr>
        <td align="${p.align}">
          <a href="${p.url}" target="_blank">
            <img src="${p.thumbnailUrl}" alt="Video" width="${p.width}" style="display: block; max-width: 100%; height: auto;" />
          </a>
        </td>
      </tr>
    </table>`
}

function generateSocialHTML(block) {
    const p = block.properties
    const margin = `${p.margin.top}px ${p.margin.right}px ${p.margin.bottom}px ${p.margin.left}px`

    const socialIcons = {
        facebook: 'https://cdn-icons-png.flaticon.com/512/124/124010.png',
        twitter: 'https://cdn-icons-png.flaticon.com/512/12107/12107611.png',
        x: 'https://cdn-icons-png.flaticon.com/512/12107/12107611.png',
        instagram: 'https://cdn-icons-png.flaticon.com/512/174/174855.png',
        linkedin: 'https://cdn-icons-png.flaticon.com/512/174/174857.png',
        youtube: 'https://cdn-icons-png.flaticon.com/512/174/174883.png',
        pinterest: 'https://cdn-icons-png.flaticon.com/512/174/174863.png',
        tiktok: 'https://cdn-icons-png.flaticon.com/512/3116/3116491.png',
        github: 'https://cdn-icons-png.flaticon.com/512/733/733553.png'
    }

    const iconsHtml = p.icons.map(icon => `
    <a href="${icon.url}" target="_blank" style="display: inline-block; margin: 0 ${p.iconSpacing / 2}px;">
      <img src="${socialIcons[icon.platform] || ''}" alt="${icon.platform}" width="${p.iconSize}" height="${p.iconSize}" style="display: block;" />
    </a>
  `).join('')

    return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: ${margin};">
      <tr>
        <td align="${p.align}">
          ${iconsHtml}
        </td>
      </tr>
    </table>`
}

function generateTableHTML(block) {
    const p = block.properties
    const margin = `${p.margin.top}px ${p.margin.right}px ${p.margin.bottom}px ${p.margin.left}px`

    const rowsHtml = p.rows.map(row => `
    <tr>
      ${row.cells.map(cell => `
        <td style="border: ${p.borderWidth}px solid ${p.borderColor}; padding: ${p.cellPadding}px; background-color: ${p.backgroundColor}; color: ${p.textColor}; font-size: ${p.fontSize}px;">
          ${escapeHtml(cell)}
        </td>
      `).join('')}
    </tr>
  `).join('')

    return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: ${margin}; border-collapse: collapse;">
      ${rowsHtml}
    </table>`
}

function generateRowHTML(block) {
    const p = block.properties
    const padding = `${p.padding.top}px ${p.padding.right}px ${p.padding.bottom}px ${p.padding.left}px`

    const columnsHtml = block.columns.map(column => {
        const columnContent = column.blocks.map(b => generateBlockHTML(b)).join('\n')
        return `
      <td width="${column.width}%" valign="top" style="padding: ${padding};">
        ${columnContent}
      </td>
    `
    }).join('')

    return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${p.backgroundColor};">
      <tr>
        ${columnsHtml}
      </tr>
    </table>`
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }
    return String(text).replace(/[&<>"']/g, m => map[m])
}
