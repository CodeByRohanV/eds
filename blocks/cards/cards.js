import { createOptimizedPicture } from '../../scripts/aem.js';

function formatPrice(val) {
  const digits = val.replace(/[^\d]/g, '');
  if (!digits) return val;
  return Number(digits).toLocaleString('en-IN');
}

function parseCardBody(bodyDiv) {
  const hasHeadings = bodyDiv.querySelector('h1, h2, h3, h4, h5, h6');
  const hasParagraphs = bodyDiv.querySelector('p');
  const hasLinks = bodyDiv.querySelector('a');

  // If already structured with standard authoring, just polish classes
  if (hasHeadings || (hasParagraphs && hasLinks)) {
    const heading = bodyDiv.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) heading.classList.add('product-title');
    return;
  }

  // Parse plain text / <br> separated authored lines
  const rawHtml = bodyDiv.innerHTML;
  const lines = rawHtml
    .split(/<br\s*[/]?>/gi)
    .map((s) => s.replace(/<[^>]*>/g, '').trim())
    .filter(Boolean);

  if (lines.length === 0) return;

  bodyDiv.innerHTML = '';

  let titleSet = false;
  let ratingVal = null;
  let ratingCount = null;
  let priceVal = null;
  let deliveryVal = null;
  const otherDetails = [];

  lines.forEach((line) => {
    if (!titleSet) {
      titleSet = line;
    } else if (/^[0-5](\.\d)?(\s*\/\s*5)?$/.test(line) || line.includes('★')) {
      ratingVal = line.replace(/[^0-9.]/g, '');
    } else if (/^\d{3,12}$/.test(line)) {
      ratingCount = Number(line).toLocaleString('en-IN');
    } else if (/rs|inr|₹|\$|price/i.test(line) || /^\d+(\.\d{2})?\s*(rs|inr)?$/i.test(line)) {
      priceVal = line;
    } else if (/delivery|wed|thu|fri|sat|sun|mon|tue|nov|dec|jan|feb|mar|apr|may|jun|jul|aug|sep|oct/i.test(line)) {
      deliveryVal = line;
    } else {
      otherDetails.push(line);
    }
  });

  if (titleSet) {
    const titleEl = document.createElement('h3');
    titleEl.className = 'product-title';
    titleEl.textContent = titleSet;
    bodyDiv.append(titleEl);
  }

  if (ratingVal) {
    const ratingDiv = document.createElement('div');
    ratingDiv.className = 'product-rating';
    ratingDiv.innerHTML = `<span class="rating-badge">★ ${ratingVal}</span>${
      ratingCount ? `<span class="rating-count">(${ratingCount})</span>` : ''
    }`;
    bodyDiv.append(ratingDiv);
  }

  if (priceVal) {
    const priceDiv = document.createElement('div');
    priceDiv.className = 'product-price';
    priceDiv.innerHTML = `<span class="price-symbol">₹</span><span class="price-amount">${formatPrice(priceVal)}</span>`;
    bodyDiv.append(priceDiv);
  }

  if (deliveryVal) {
    const deliveryDiv = document.createElement('div');
    deliveryDiv.className = 'product-delivery';
    deliveryDiv.innerHTML = `<span class="delivery-badge">FREE Delivery</span> <span class="delivery-date">${deliveryVal}</span>`;
    bodyDiv.append(deliveryDiv);
  }

  if (otherDetails.length > 0) {
    const metaDiv = document.createElement('div');
    metaDiv.className = 'product-meta';
    metaDiv.textContent = otherDetails.join(' · ');
    bodyDiv.append(metaDiv);
  }

  // Add to Cart action button
  const actionDiv = document.createElement('div');
  actionDiv.className = 'product-actions';
  const cta = document.createElement('a');
  cta.className = 'product-buy-btn';
  cta.href = '#cart';
  cta.textContent = 'Add to Cart';
  actionDiv.append(cta);
  bodyDiv.append(actionDiv);
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
        parseCardBody(div);
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
  block.replaceChildren(ul);
}
