// JavaScript: concrete cover calculation
// Copyright © 2025 Dimitry Lyubichev / beton-guide.com.
// All rights reserved. Unauthorized reproduction or use is strictly prohibited.

document.addEventListener('DOMContentLoaded', () => {
  // Attach listeners (guarded) and initialize once
  const selectors = [
    '.calcul-four-select_duree',
    '.calcul-four-select-classe_exposition',
    '.calcul-four-select-classe_beton',
    '.calcul-four-select-cem1',
    '.calcul-four-select-enr_compact',
    '.calcul-four-select-c_min_b'
  ];

  selectors.forEach(sel => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.addEventListener('change', calculEnrobage);
  });

  // Initial compute
  calculEnrobage();
});

let fck = 25;
let fctm = 2.6; // kept for potential future use

function calculEnrobage() {
  // 1) Service life remark
  const select_duree = document.querySelector('.calcul-four-select_duree');
  let duree = Number(select_duree?.value || 50);

  const dureeEl = document.querySelector('.calcul-four_duree');
  if (dureeEl) {
    switch (String(duree)) {
      case '10':
        dureeEl.innerHTML = 'Temporary structures.';
        break;
      case '15':
        dureeEl.innerHTML = 'Replaceable structural elements, such as bearings.';
        break;
      case '25':
        dureeEl.innerHTML = 'Agricultural and similar structures.';
        break;
      case '50':
        dureeEl.innerHTML = 'Buildings and other common structures.';
        break;
      case '100':
        dureeEl.innerHTML = 'Monumental building structures, bridges and other civil engineering works.';
        break;
    }
  }

  // 2) Exposure class -> expValue (XO=0, XC=1+, XD=2+, XS=3+, XF=4+, XA=5+) and min strength
  const select_classeExposition = document.querySelector('.calcul-four-select-classe_exposition');
  let classeExposition = 20; // proxy for minimum strength check
  let expValue = 11;
  let beton = 'C20/25';

  switch (select_classeExposition?.value) {
    case 'XO':
      classeExposition = 12; expValue = 0;  beton = 'C12/15'; break;
    case 'XC1':
      classeExposition = 20; expValue = 11; beton = 'C20/25'; break;
    case 'XC2':
      classeExposition = 20; expValue = 12; beton = 'C20/25'; break;
    case 'XC3':
      classeExposition = 25; expValue = 13; beton = 'C25/30'; break;
    case 'XC4': // missing in original; added for consistency
      classeExposition = 30; expValue = 14; beton = 'C30/37'; break;
    case 'XD1':
      classeExposition = 25; expValue = 21; beton = 'C25/30'; break;
    case 'XD2':
      classeExposition = 30; expValue = 22; beton = 'C30/37'; break;
    case 'XD3':
      classeExposition = 35; expValue = 23; beton = 'C35/45'; break;
    case 'XS1':
      classeExposition = 30; expValue = 31; beton = 'C30/37'; break;
    case 'XS2':
      classeExposition = 30; expValue = 32; beton = 'C30/37'; break;
    case 'XS3':
      classeExposition = 35; expValue = 33; beton = 'C40/50'; break;
    case 'XF1':
      classeExposition = 25; expValue = 41; beton = 'C25/30'; break;
    case 'XF2':
      classeExposition = 25; expValue = 42; beton = 'C25/30'; break;
    case 'XF3':
      classeExposition = 30; expValue = 43; beton = 'C30/37'; break;
    case 'XF4':
      classeExposition = 35; expValue = 44; beton = 'C35/45'; break;
    case 'XA1':
      classeExposition = 30; expValue = 51; beton = 'C30/37'; break;
    case 'XA2':
      classeExposition = 35; expValue = 52; beton = 'C35/45'; break;
    case 'XA3':
      classeExposition = 40; expValue = 53; beton = 'C40/50'; break;
  }

  // 3) Strength class (fck, fctm)
  const select_fck = document.querySelector('.calcul-four-select-classe_beton');
  switch (select_fck?.value) {
    case '12-15': fck = 12; fctm = 1.6; break;
    case '16-20': fck = 16; fctm = 1.9; break;
    case '20-25': fck = 20; fctm = 2.2; break;
    case '25-30': fck = 25; fctm = 2.6; break;
    case '30-37': fck = 30; fctm = 2.9; break;
    case '35-45': fck = 35; fctm = 3.2; break;
    case '40-50': fck = 40; fctm = 3.5; break;
    case '45-55': fck = 45; fctm = 3.8; break;
    case '50-60': fck = 50; fctm = 4.1; break;
  }

  // 4) Warning if strength class is insufficient for exposure
  const alertEl = document.querySelector('.alert-element-classe_beton');
  if (alertEl) {
    if (classeExposition > fck) {
      alertEl.innerHTML = `Warning: for this exposure class, the concrete strength class must be equal to or greater than ${beton}.`;
    } else {
      alertEl.innerHTML = '';
    }
  }

  // 5) CEM I without fly ash and compact cover flags
  const cem1 = Number(document.querySelector('.calcul-four-select-cem1')?.value || 1);
  const cCom = Number(document.querySelector('.calcul-four-select-enr_compact')?.value || 1);

  // 6) Structural class coefficient
  let expCoef = 0;

  // Service life
  if (duree === 100) {
    expCoef += 2;
  } // <=25 adds 0

  // CEM I without fly ash (YES and fck >= 35 gives -1)
  if (cem1 === 2 && fck >= 35) {
    expCoef -= 1;
  }

  // Compact cover (YES gives -1)
  if (cCom === 2) {
    expCoef -= 1;
  }

  // Strength vs exposure finer adjustments
  if (fck >= 30 && fck < 50 && (expValue === 0 || expValue === 11)) {
    expCoef -= 1;
  } else if (fck >= 50 && (expValue === 0 || expValue === 11)) {
    expCoef -= 2;
  } else if (fck >= 30 && fck < 55 && (expValue === 12 || expValue === 13)) {
    expCoef -= 1;
  } else if (fck >= 55 && (expValue === 12 || expValue === 13)) {
    expCoef -= 2;
  } else if (fck >= 35 && fck < 60 && (expValue === 14 || expValue === 41 || expValue === 43)) {
    expCoef -= 1;
  } else if (fck >= 60 && (expValue === 14 || expValue === 41 || expValue === 43)) {
    expCoef -= 2;
  } else if (fck >= 40 && fck < 60 && (expValue === 21 || expValue === 31 || expValue === 51 || expValue === 22 || expValue === 32 || expValue === 52 || expValue === 42 || expValue === 44)) {
    expCoef -= 1;
  } else if (fck >= 60 && (expValue === 21 || expValue === 31 || expValue === 51 || expValue === 22 || expValue === 32 || expValue === 52 || expValue === 42 || expValue === 44)) {
    expCoef -= 2;
  } else if (fck >= 45 && fck < 70 && (expValue === 23 || expValue === 33 || expValue === 53)) {
    expCoef -= 1;
  } else if (fck >= 70 && (expValue === 23 || expValue === 33 || expValue === 53)) {
    expCoef -= 1;
  }

  // Base S4 adjusted by expCoef, clamped to [1..6] for mapping
  let classeStr = Math.min(6, Math.max(1, 4 + expCoef));
  const classeStrEl = document.querySelector('.calcul-four-beton-classe_str');
  if (classeStrEl) classeStrEl.innerHTML = `S${classeStr}`;

  // 7) Compute c_min,dur from mapping (by structural class and exposure value)
  let cMindur;
  const mappings = {
    1: { 0: 10, 11: 10, 12: 10, 13: 10, 14: 15, 41: 15, 21: 20, 31: 20, 42: 20, 43: 20, 22: 25, 32: 25, 44: 25, 23: 30, 33: 30 },
    2: { 0: 10, 11: 10, 12: 15, 13: 15, 14: 20, 41: 20, 21: 25, 31: 25, 42: 25, 43: 25, 22: 30, 32: 30, 44: 30, 23: 35, 33: 35 },
    3: { 0: 10, 11: 10, 12: 20, 13: 20, 14: 25, 41: 25, 21: 30, 31: 30, 42: 30, 43: 30, 22: 35, 32: 35, 44: 35, 23: 40, 33: 40 },
    4: { 0: 10, 11: 15, 12: 25, 13: 25, 14: 30, 41: 30, 21: 35, 31: 35, 42: 35, 43: 35, 22: 40, 32: 40, 44: 40, 23: 45, 33: 45 },
    5: { 0: 15, 11: 20, 12: 30, 13: 30, 14: 35, 41: 35, 21: 40, 31: 40, 42: 40, 43: 40, 22: 45, 32: 45, 44: 45, 23: 50, 33: 50 },
    6: { 0: 20, 11: 25, 12: 35, 13: 35, 14: 40, 41: 40, 21: 45, 31: 45, 42: 45, 43: 45, 22: 50, 32: 50, 44: 50, 23: 55, 33: 55 }
  };

  if (mappings[classeStr] && mappings[classeStr][expValue] != null) {
    cMindur = mappings[classeStr][expValue];
  } else {
    // Fallback if something is unmapped
    cMindur = 10;
  }

  const cMindurEl = document.querySelector('.calcul-enrobage_min_dur');
  if (cMindurEl) cMindurEl.innerHTML = String(cMindur);

  // 8) c_min (bond vs durability vs 10 mm)
  const cMinbSel = document.querySelector('.calcul-four-select-c_min_b');
  const cMinb = Number(cMinbSel?.value || 10);
  const cmin = Math.max(Number(cMinb), Number(cMindur), 10);

  const cminEl = document.querySelector('.calcul-enrobage_min');
  if (cminEl) cminEl.innerHTML = String(cmin);

  // 9) c_nom in cm with Δc_dev = 10 mm
  const cNom = (cmin / 10) + 1;
  const cNomEl = document.querySelector('.calcul-enrobage_nom');
  if (cNomEl) cNomEl.innerHTML = Number.isFinite(cNom) ? cNom.toFixed(1) : '';
}
