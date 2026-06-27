(function () {
  const $ = (id) => document.getElementById(id);

  const els = {
    emirate: $('emirate'),
    price: $('price'),
    rentMode: $('rentMode'),
    monthlyRent: $('monthlyRent'),
    annualRent: $('annualRent'),
    rentMonthlyWrap: $('rentMonthlyWrap'),
    rentAnnualWrap: $('rentAnnualWrap'),
    serviceCharge: $('serviceCharge'),
    vacancy: $('vacancy'),
    mgmtFee: $('mgmtFee'),
    maintenance: $('maintenance'),
    fxRate: $('fxRate'),
    advToggle: $('advToggle'),
    advPanel: $('advPanel'),
    purchaseCosts: $('purchaseCosts'),
    useMortgage: $('useMortgage'),
    mortgagePanel: $('mortgagePanel'),
    downPct: $('downPct'),
    interestRate: $('interestRate'),
    loanYears: $('loanYears'),
    serviceHint: $('serviceHint'),
    priceCny: $('priceCny'),
    grossYield: $('grossYield'),
    netYield: $('netYield'),
    netYieldTotal: $('netYieldTotal'),
    netYieldTotalRow: $('netYieldTotalRow'),
    payback: $('payback'),
    monthlyNet: $('monthlyNet'),
    annualNOI: $('annualNOI'),
    mortgageSection: $('mortgageSection'),
    cashOnCash: $('cashOnCash'),
    monthlyCashFlow: $('monthlyCashFlow'),
    annualDebt: $('annualDebt'),
    bdGrossRent: $('bdGrossRent'),
    bdVacancy: $('bdVacancy'),
    bdEffective: $('bdEffective'),
    bdService: $('bdService'),
    bdMgmt: $('bdMgmt'),
    bdMaint: $('bdMaint'),
    bdNoi: $('bdNoi'),
  };

  function parseNum(v) {
    const n = parseFloat(String(v).replace(/,/g, '').trim());
    return Number.isFinite(n) ? n : 0;
  }

  function fmtAED(n) {
    if (!Number.isFinite(n)) return '—';
    return Math.round(n).toLocaleString('en-US');
  }

  function fmtPct(n, digits) {
    if (!Number.isFinite(n)) return '—';
    return n.toFixed(digits ?? 2) + '%';
  }

  function fmtYears(n) {
    if (!Number.isFinite(n) || n <= 0) return '—';
    return n.toFixed(1);
  }

  function pmt(principal, annualRate, years) {
    if (principal <= 0 || years <= 0) return 0;
    const r = annualRate / 100 / 12;
    const n = years * 12;
    if (r === 0) return principal / n;
    return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  function toggleRentMode() {
    const monthly = els.rentMode.value === 'monthly';
    els.rentMonthlyWrap.hidden = !monthly;
    els.rentAnnualWrap.hidden = monthly;
    recalc();
  }

  function toggleAdv() {
    const open = els.advPanel.hidden;
    els.advPanel.hidden = !open;
    els.advToggle.textContent = SiteI18n.t(open ? 'toggle.advanced.open' : 'toggle.advanced.closed');
  }

  function toggleMortgagePanel() {
    els.mortgagePanel.hidden = !els.useMortgage.checked;
    els.mortgageSection.hidden = !els.useMortgage.checked;
    recalc();
  }

  function updateServiceHint() {
    const key = els.emirate.value === 'dubai' ? 'hint.serviceCharge.dubai' : 'hint.serviceCharge.abudhabi';
    els.serviceHint.textContent = SiteI18n.t(key);
  }

  function recalc() {
    const price = parseNum(els.price.value);
    const fx = parseNum(els.fxRate.value) || 1.95;
    const purchaseCosts = parseNum(els.purchaseCosts.value);
    const serviceCharge = parseNum(els.serviceCharge.value);
    const vacancyPct = Math.min(100, Math.max(0, parseNum(els.vacancy.value)));
    const mgmtPct = Math.min(100, Math.max(0, parseNum(els.mgmtFee.value)));
    const maintPct = Math.min(100, Math.max(0, parseNum(els.maintenance.value)));

    let grossRent = els.rentMode.value === 'monthly'
      ? parseNum(els.monthlyRent.value) * 12
      : parseNum(els.annualRent.value);

    els.priceCny.textContent = price > 0 ? fmtAED(price * fx) : '—';

    if (price <= 0 || grossRent <= 0) {
      ['grossYield', 'netYield', 'netYieldTotal', 'payback', 'monthlyNet', 'annualNOI',
        'cashOnCash', 'monthlyCashFlow', 'annualDebt'].forEach((k) => {
        if (els[k]) els[k].textContent = '—';
      });
      return;
    }

    const vacancyLoss = grossRent * (vacancyPct / 100);
    const effectiveRent = grossRent - vacancyLoss;
    const mgmtFee = effectiveRent * (mgmtPct / 100);
    const maintenance = effectiveRent * (maintPct / 100);
    const noi = effectiveRent - serviceCharge - mgmtFee - maintenance;

    const grossYield = (grossRent / price) * 100;
    const netYield = (noi / price) * 100;
    const totalInvest = price + purchaseCosts;
    const netYieldTotal = purchaseCosts > 0 ? (noi / totalInvest) * 100 : null;
    const payback = noi > 0 ? price / noi : null;

    els.grossYield.textContent = fmtPct(grossYield);
    els.netYield.textContent = fmtPct(netYield);
    els.payback.textContent = fmtYears(payback);
    els.monthlyNet.textContent = fmtAED(noi / 12);
    els.annualNOI.textContent = fmtAED(noi);

    if (netYieldTotal != null) {
      els.netYieldTotal.textContent = fmtPct(netYieldTotal);
      els.netYieldTotalRow.hidden = false;
    } else {
      els.netYieldTotalRow.hidden = true;
    }

    els.bdGrossRent.textContent = fmtAED(grossRent);
    els.bdVacancy.textContent = '− ' + fmtAED(vacancyLoss);
    els.bdEffective.textContent = fmtAED(effectiveRent);
    els.bdService.textContent = '− ' + fmtAED(serviceCharge);
    els.bdMgmt.textContent = '− ' + fmtAED(mgmtFee);
    els.bdMaint.textContent = '− ' + fmtAED(maintenance);
    els.bdNoi.textContent = fmtAED(noi);

    if (els.useMortgage.checked) {
      const downPct = Math.min(100, Math.max(0, parseNum(els.downPct.value)));
      const rate = parseNum(els.interestRate.value);
      const years = parseNum(els.loanYears.value);
      const loan = price * (1 - downPct / 100);
      const downPayment = price * (downPct / 100);
      const equity = downPayment + purchaseCosts;
      const monthlyPayment = pmt(loan, rate, years);
      const annualDebt = monthlyPayment * 12;
      const annualCashFlow = noi - annualDebt;
      const coc = equity > 0 ? (annualCashFlow / equity) * 100 : null;

      els.annualDebt.textContent = fmtAED(annualDebt);
      els.monthlyCashFlow.textContent = fmtAED(annualCashFlow / 12);
      els.cashOnCash.textContent = coc != null ? fmtPct(coc) : '—';
    }
  }

  function bind() {
    [
      els.emirate, els.price, els.rentMode, els.monthlyRent, els.annualRent,
      els.serviceCharge, els.vacancy, els.mgmtFee, els.maintenance, els.fxRate,
      els.purchaseCosts, els.downPct, els.interestRate, els.loanYears,
    ].forEach((el) => {
      if (!el) return;
      el.addEventListener('input', recalc);
      el.addEventListener('change', recalc);
    });

    els.rentMode.addEventListener('change', toggleRentMode);
    els.emirate.addEventListener('change', () => { updateServiceHint(); recalc(); });
    els.advToggle.addEventListener('click', toggleAdv);
    els.useMortgage.addEventListener('change', toggleMortgagePanel);

    window.addEventListener('site-lang-change', () => {
      updateServiceHint();
      if (!els.advPanel.hidden) {
        els.advToggle.textContent = SiteI18n.t('toggle.advanced.open');
      } else {
        els.advToggle.textContent = SiteI18n.t('toggle.advanced.closed');
      }
    });
  }

  bind();
  toggleRentMode();
  updateServiceHint();
  recalc();
})();
