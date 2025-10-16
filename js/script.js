
console.log("Hello, World!");

document.addEventListener('DOMContentLoaded', () => {
  const options = Array.from(document.querySelectorAll('.side-option'));
  const heroInner = document.querySelector('.hero-inner');
  const heroStepEl = document.querySelector('.hero-step');
  const editor = document.getElementById('editor-notes');

  if (!options.length || !heroInner || !heroStepEl || !editor) return;

  const defaultHeroInnerHtml = heroInner.innerHTML;

  function keyFor(btn) {
    return 'hero-note-' + (btn.getAttribute('data-key') || btn.getAttribute('data-title') || (btn.textContent || '').trim()).toString().toLowerCase().replace(/\s+/g, '-');
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[s]));
  }

  function saveFor(btn) {
    if (!btn) return;
    const key = keyFor(btn);
    if (btn.getAttribute('data-key') === 'your-superhero' || btn.getAttribute('data-key') === 'tips') return;
    try {
      localStorage.setItem(key, editor.value || '');
    } catch (e) {}
  }

  function loadFor(btn) {
    if (!btn) return;
    const key = keyFor(btn);
    if (btn.getAttribute('data-key') === 'your-superhero' || btn.getAttribute('data-key') === 'tips') {
      editor.value = '';
      return;
    }
    const val = localStorage.getItem(key);
    editor.value = val !== null ? val : '';
  }

  function buildSummaryParts() {
    const parts = [];
    options.forEach(btn => {
      const k = btn.getAttribute('data-key');
      if (k === 'your-superhero' || k === 'tips') return;
      const label = btn.getAttribute('data-title') || (btn.textContent || '').trim();
      const note = localStorage.getItem(keyFor(btn)) || '';
      parts.push({ label: label, note: note.trim() });
    });
    return parts;
  }

  function renderSummaryHtml() {
    const parts = buildSummaryParts();
    if (!parts.length) return '<p>(no notes)</p>';
    return parts.map(p => {
      const safeLabel = escapeHtml(p.label);
      const safeNote = escapeHtml(p.note || '(no notes)');
      const htmlNote = safeNote.replace(/\n/g, '<br>');
      return `<div class="summary-section"><h3 class="summary-label">${safeLabel}</h3><p class="summary-note">${htmlNote}</p></div>`;
    }).join('');
  }

  let currentBtn = null;

  function stepNumberFor(btn) {
    const key = btn.getAttribute('data-key');
    if (key === 'tips') return 0;
    const nonTips = options.filter(b => b.getAttribute('data-key') !== 'tips');
    return nonTips.indexOf(btn) + 1;
  }

  function setFromButton(btn) {
    if (currentBtn && currentBtn !== btn) saveFor(currentBtn);
    currentBtn = btn;

    const newTitle = btn.getAttribute('data-title') || btn.textContent || '';
    const newText = btn.getAttribute('data-text') || '';
    const isSummary = btn.getAttribute('data-key') === 'your-superhero';
    const isTips = btn.getAttribute('data-key') === 'tips';

    if (isSummary) {
      heroInner.innerHTML = `<div class="summary-wrapper">${renderSummaryHtml()}</div>`;
      editor.style.display = 'none';
    } else if (isTips) {
      heroInner.innerHTML = `
        <h1 class="hero-title">Tips</h1>
        <p>
          Okay! Let’s get started. Today we are going to make a Superhero! There’s going to be a few steps but I want to give you some tips beforehand.
          On the right hand side of your screen is a Notes tab. For each and every section here, I recommend you write down in the notes tab what you want pertaining to that section.
          Step 7 is a summary of all your notes, and when you’re finished you will be able to get all of your information in one place to be able to paste it into an AI software of your choosing to see what your superhero looks like!
        </p>
      `;
      editor.style.display = 'none';

    } else {
      if (heroInner.innerHTML !== defaultHeroInnerHtml) heroInner.innerHTML = defaultHeroInnerHtml;
      editor.style.display = '';
      editor.readOnly = false;

      const titleEl = heroInner.querySelector('.hero-title');
      const textEl = heroInner.querySelector('p');
      if (titleEl) titleEl.textContent = newTitle;
      if (textEl) textEl.textContent = newText;

      loadFor(btn);
    }

    const label = (btn.textContent || '').trim();
    const stepLabel = label === 'Origin' ? 'Origin Story' : label;
    const stepNum = stepNumberFor(btn);

    if (stepNum === 0) {
      heroStepEl.textContent = `Step 0: ${stepLabel}`;
    } else if (isSummary) {
      heroStepEl.textContent = `Step ${stepNum}: Review your Superhero`;
    } else {
      heroStepEl.textContent = `Step ${stepNum}: Choose your ${stepLabel}`;
    }

    options.forEach(b => b.classList.toggle('active', b === btn));
  }

  options.forEach(btn => btn.addEventListener('click', () => setFromButton(btn)));

  let saveTimer = null;
  editor.addEventListener('input', () => {
    if (!currentBtn) return;
    const key = currentBtn.getAttribute('data-key');
    if (key === 'your-superhero' || key === 'tips') return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveFor(currentBtn), 400);
  });

  const active = options.find(b => b.classList.contains('active')) || options[0];
  if (active) setFromButton(active);
});
