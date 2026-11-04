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

    const contentAlignment = bodySettings.contentAlignment === 'left' ? 'left' : 'center'
    const contentWidth = Number(bodySettings.contentWidth) || 600
    const backgroundColor = css(bodySettings.backgroundColor)
    const fontFamily = css(bodySettings.fontFamily)
    const fontWeight = css(bodySettings.fontWeight || 'normal')
    const textColor = css(bodySettings.textColor || '#000000')

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
    a { color: ${css(bodySettings.linkColor || '#2f4574')}; text-decoration: underline; }
    /* Mobile: let the content shrink and stack row columns vertically */
    @media only screen and (max-width: ${contentWidth + 20}px) {
      .cb-container { width: 100% !important; max-width: 100% !important; }
      .cb-col { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; }
      /* stacked columns would otherwise double the row padding between them */
      .cb-col + .cb-col { padding-top: 0 !important; }
      img { max-width: 100% !important; height: auto !important; }
${mobileAlignCss()}
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${backgroundColor}; font-family: ${fontFamily}; font-weight: ${fontWeight}; color: ${textColor};">
  ${preheaderHtml}
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${backgroundColor};">
    <tr>
      <td align="${contentAlignment}" style="padding: 20px 0;">
        <table class="cb-container" border="0" cellpadding="0" cellspacing="0" width="${contentWidth}" style="width: 100%; max-width: ${contentWidth}px; background-color: #ffffff;">
          <tr>
            <td style="font-family: ${fontFamily}; font-weight: ${fontWeight}; color: ${textColor};">
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
    const margin = spacing(p.margin)
    const padding = spacing(p.padding)

    return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: ${margin};">
      <tr>
        <td align="${align(p.align)}"${mobileAlignClass(p)}>
          <table border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="border-radius: ${css(p.borderRadius)}px; background-color: ${css(p.backgroundColor)};">
                <a href="${url(p.url)}" target="_blank" style="display: inline-block; padding: ${padding}; font-family: ${css(p.fontFamily)}; font-size: ${css(p.fontSize)}px; font-weight: ${css(p.fontWeight)}; color: ${css(p.textColor)}; text-decoration: ${css(p.textDecoration)}; border-radius: ${css(p.borderRadius)}px;">
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
    const margin = spacing(p.margin)

    return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: ${margin};">
      <tr>
        <td align="${align(p.align)}"${mobileAlignClass(p)}>
          <table border="0" cellpadding="0" cellspacing="0" width="${attr(p.width)}%">
            <tr>
              <td style="border-top: ${attr(p.height)}px solid ${css(p.color)};"></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

function generateHeadingHTML(block) {
    const p = block.properties
    const margin = spacing(p.margin)
    const padding = spacing(p.padding)

    return `
    <div${mobileAlignClass(p)} style="margin: ${margin}; padding: ${padding}; font-family: ${css(p.fontFamily)}; font-size: ${css(p.fontSize)}px; font-weight: ${css(p.fontWeight)}; color: ${css(p.color)}; line-height: ${css(p.lineHeight)}; letter-spacing: ${css(p.letterSpacing)}px; text-align: ${align(p.align)};">
      ${p.text}
    </div>`
}

function generateParagraphHTML(block) {
    const p = block.properties
    const margin = spacing(p.margin)
    const padding = spacing(p.padding)

    return `
    <div${mobileAlignClass(p)} style="margin: ${margin}; padding: ${padding}; font-family: ${css(p.fontFamily)}; font-size: ${css(p.fontSize)}px; font-weight: ${css(p.fontWeight)}; color: ${css(p.color)}; line-height: ${css(p.lineHeight)}; letter-spacing: ${css(p.letterSpacing)}px; text-align: ${align(p.align)};">
      ${p.text}
    </div>`
}

function generateImageHTML(block) {
    const p = block.properties
    const margin = spacing(p.margin)

    const imgTag = `<img src="${url(p.url, IMAGE_SCHEMES)}" alt="${escapeHtml(p.alt)}" width="${attr(p.width)}" height="${attr(p.height)}" style="display: block; max-width: 100%; height: auto;" />`

    const content = p.link ? `<a href="${url(p.link)}" target="_blank">${imgTag}</a>` : imgTag

    return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: ${margin};">
      <tr>
        <td align="${align(p.align)}"${mobileAlignClass(p)}>
          ${content}
        </td>
      </tr>
    </table>`
}

function generateVideoHTML(block) {
    const p = block.properties
    const margin = spacing(p.margin)

    return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: ${margin};">
      <tr>
        <td align="${align(p.align)}"${mobileAlignClass(p)}>
          <a href="${url(p.url)}" target="_blank">
            <img src="${url(p.thumbnailUrl, IMAGE_SCHEMES)}" alt="Video" width="${attr(p.width)}" style="display: block; max-width: 100%; height: auto;" />
          </a>
        </td>
      </tr>
    </table>`
}

function generateSocialHTML(block) {
    const p = block.properties
    const margin = spacing(p.margin)

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
    <a href="${url(icon.url)}" target="_blank" style="display: inline-block; margin: 0 ${(Number(p.iconSpacing) || 0) / 2}px;">
      <img src="${socialIcons[icon.platform] || ''}" alt="${escapeHtml(icon.platform)}" width="${css(p.iconSize)}" height="${css(p.iconSize)}" style="display: block;" />
    </a>
  `).join('')

    return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: ${margin};">
      <tr>
        <td align="${align(p.align)}"${mobileAlignClass(p)}>
          ${iconsHtml}
        </td>
      </tr>
    </table>`
}

function generateTableHTML(block) {
    const p = block.properties
    const margin = spacing(p.margin)

    const rowsHtml = p.rows.map(row => `
    <tr>
      ${row.cells.map(cell => `
        <td style="border: ${css(p.borderWidth)}px solid ${css(p.borderColor)}; padding: ${css(p.cellPadding)}px; background-color: ${css(p.backgroundColor)}; color: ${css(p.textColor)}; font-size: ${css(p.fontSize)}px;">
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
    const padding = spacing(p.padding)

    // single column rows have nothing to stack
    const stacks = block.columns.length > 1

    const columnsHtml = block.columns.map(column => {
        const columnContent = column.blocks.map(b => generateBlockHTML(b)).join('\n')
        return `
      <td class="${stacks ? 'cb-col' : ''}" width="${Number(column.width) || 0}%" valign="top" style="padding: ${padding};">
        ${columnContent}
      </td>
    `
    }).join('')

    return `
    <table class="cb-row" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${css(p.backgroundColor)};">
      <tr>
        ${columnsHtml}
      </tr>
    </table>`
}

const MOBILE_ALIGNMENTS = ['left', 'center', 'right']

/**
 * Optional `mobileAlign` block property ('left' | 'center' | 'right'): overrides the block's
 * alignment on small screens only, e.g. right-aligned content in a column that stacks.
 */
function mobileAlignClass(p) {
    return MOBILE_ALIGNMENTS.includes(p?.mobileAlign) ? ` class="cb-m-${p.mobileAlign}"` : ''
}

function mobileAlignCss() {
    const margins = { left: '0 auto 0 0', center: '0 auto', right: '0 0 0 auto' }

    return MOBILE_ALIGNMENTS.map(align => `      .cb-m-${align}, div.cb-m-${align} * { text-align: ${align} !important; text-align: -webkit-${align} !important; }
      td.cb-m-${align} > table { margin: ${margins[align]} !important; }`).join('\n')
}

const LINK_SCHEMES = ['http', 'https', 'mailto', 'tel']
const IMAGE_SCHEMES = ['http', 'https', 'cid']

function align(value) {
    return MOBILE_ALIGNMENTS.includes(value) ? value : 'left'
}

function spacing(s = {}) {
    const side = v => `${parseFloat(v) || 0}px`
    return `${side(s.top)} ${side(s.right)} ${side(s.bottom)} ${side(s.left)}`
}

/** Escape a value for use inside a double-quoted HTML attribute. */
function attr(value) {
    return escapeHtml(value ?? '')
}

/**
 * Sanitise a single CSS value for an inline style attribute: drops characters that could end
 * the declaration or the attribute, so a value can't inject extra CSS or markup.
 */
function css(value) {
    return attr(String(value ?? '').replace(/[;{}<>"\\]/g, ''))
}

/**
 * Escape a URL for an href/src attribute, allowing only safe schemes. Relative URLs, anchors and
 * scheme-less merge tags (e.g. $$unsubscribe_url$$, {{link}}) pass through; anything else
 * (javascript:, vbscript:, data:, ...) is replaced with '#'. Images may also use data:image/.
 */
function url(value, schemes = LINK_SCHEMES) {
    const raw = String(value ?? '').trim()
    // browsers ignore control characters and whitespace when parsing a scheme
    const normalised = raw.replace(/[\u0000-\u0020\u007f]/g, '')
    const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(normalised)?.[1]?.toLowerCase()

    const allowed = !scheme
        || schemes.includes(scheme)
        || (schemes === IMAGE_SCHEMES && /^data:image\/(png|jpe?g|gif|webp);/i.test(normalised))

    return allowed ? attr(raw) : '#'
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
