import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  // 1. Create a semantic unordered list
  const ul = document.createElement('ul');

  // 2. Loop through every row authored by the content creator
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'product-list-card';

    // Move all cells into the <li>
    while (row.firstElementChild) li.append(row.firstElementChild);

    // 3. Classify cells defensively (Image cell vs Body cell)
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'product-list-card-image';
      } else {
        div.className = 'product-list-card-body';
        const link = div.querySelector('a');
        if (link) {
          link.classList.add('button', 'primary', 'product-btn');
          const strongParent = link.closest('strong');
          if (strongParent) {
            strongParent.replaceWith(link);
          }
        }
      }
    });

    ul.append(li);
  });

  // 4. Optimize all images for performance (LCP & Core Web Vitals)
  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
    );
  });

  // 5. Replace block's raw divs with the new <ul>
  block.replaceChildren(ul);
}
