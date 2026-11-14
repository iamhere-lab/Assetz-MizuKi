/* Assetz Mizu & Ki — page behaviour: config fill-in, lead forms, enquiry popup,
   gated floor plans, lightbox, tabs and the mobile action bar. */
(function () {
  "use strict";
  var C = window.SS_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (a, k) { try { return window[a].getItem(k); } catch (e) { return null; } },
    set: function (a, k, v) { try { window[a].setItem(k, v); } catch (e) { /* storage unavailable */ } }
  };
  window.dataLayer = window.dataLayer || [];
  function track(event, data) {
    var o = { event: event };
    for (var k in data || {}) o[k] = data[k];
    window.dataLayer.push(o);
  }

  /* ---------- Tag Manager ---------- */
  if (C.gtmId) {
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    var g = document.createElement("script");
    g.async = true;
    g.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(C.gtmId);
    document.head.appendChild(g);
  }

  /* ---------- Config-driven content ---------- */
  var hasPhone = !!(C.phoneE164 && C.phoneDisplay);
  $$(".js-phone").forEach(function (el) {
    if (hasPhone) {
      el.href = "tel:" + C.phoneE164;
      var t = $(".js-phone-text", el);
      if (t) t.textContent = C.phoneDisplay;
      el.setAttribute("aria-label", "Call sales on +91 " + C.phoneDisplay);
    } else if (el.classList.contains("phone-pill")) {
      // No sales number configured yet: the header pill becomes an enquiry button.
      var b = document.createElement("button");
      b.type = "button";
      b.className = "phone-pill is-cta js-open-enquiry";
      b.dataset.cta = "header_enquire";
      b.dataset.intent = "price";
      b.textContent = "Enquire Now";
      el.replaceWith(b);
    } else {
      el.hidden = true;
    }
  });
  $$(".js-whatsapp").forEach(function (el) {
    if (!C.whatsappNumber) { el.hidden = true; return; }
    el.href = "https://wa.me/" + C.whatsappNumber + (C.whatsappMessage ? "?text=" + encodeURIComponent(C.whatsappMessage) : "");
  });
  $$(".js-partner").forEach(function (el) {
    if (!C.partnerName) return;
    el.innerHTML = "";
    var s = document.createElement("strong");
    s.textContent = C.partnerName;
    el.appendChild(document.createTextNode("authorised channel partner, "));
    el.appendChild(s);
    if (C.agentRera) el.appendChild(document.createTextNode(" (Agent RERA: " + C.agentRera + ")"));
  });
  $$(".js-privacy-link").forEach(function (el) {
    if (!C.privacyUrl) { el.hidden = true; return; }
    $("a", el).href = C.privacyUrl;
  });
  $$(".js-nophone-hide").forEach(function (el) { if (!hasPhone) el.hidden = true; });

  /* ---------- Attribution ---------- */
  var ATTR_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "gbraid", "wbraid", "fbclid", "msclkid"];
  var attribution = {};
  try { attribution = JSON.parse(store.get("sessionStorage", "mk_attr") || "{}"); } catch (e) { attribution = {}; }
  try {
    var qs = new URLSearchParams(location.search);
    ATTR_KEYS.forEach(function (k) { if (qs.get(k)) attribution[k] = qs.get(k); });
    if (!attribution.landing_page) attribution.landing_page = location.pathname;
    if (!attribution.referrer && document.referrer) attribution.referrer = document.referrer;
    store.set("sessionStorage", "mk_attr", JSON.stringify(attribution));
  } catch (e) { /* ignore */ }

  /* ---------- Lead forms ---------- */
  var tpl = $("#lead-form-tpl");
  var loadedAt = Date.now();
  var engaged = false;
  var modal = $("#enquiry-modal");
  var modalCtx = { intent: "price", config: "" };

  function buildForm(slot) {
    var id = slot.dataset.formId;
    var frag = tpl.content.cloneNode(true);
    var form = $("form", frag);
    form.dataset.formId = id;
    $$("[id]", form).forEach(function (el) { el.id = el.id.replace("tpl-", "lf-" + id + "-"); });
    $$("label[for]", form).forEach(function (el) { el.htmlFor = el.htmlFor.replace("tpl-", "lf-" + id + "-"); });
    $(".js-consent-entity", form).textContent = C.consentEntity || "the developer and its authorised sales partners";
    if (slot.dataset.submitLabel) $(".btn-submit", form).textContent = slot.dataset.submitLabel;
    form.addEventListener("focusin", function () {
      if (!form.dataset.started) { form.dataset.started = "1"; engaged = true; track("form_start", { form_id: id }); }
    });
    form.addEventListener("submit", onSubmit);
    slot.innerHTML = "";
    slot.appendChild(frag);
  }
  $$(".js-form-slot").forEach(buildForm);

  function setErr(form, name, msg) {
    var input = form.elements[name];
    var err = $("#lf-" + form.dataset.formId + "-" + name + "-err", form);
    if (err) err.textContent = msg || "";
    if (input && input.setAttribute) { if (msg) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid"); }
    return !msg;
  }
  function validPhone(cc, n) {
    if (cc === "+91") return /^[6-9]\d{9}$/.test(n) && !/^(\d)\1{9}$/.test(n) && n !== "9876543210" && n !== "1234567890";
    return /^\d{6,13}$/.test(n) && !/^(\d)\1+$/.test(n);
  }
  function validate(form) {
    var f = form.elements, ok = true;
    var name = f.name.value.trim();
    var phone = f.phone.value.replace(/\D/g, "").replace(/^0+/, "");
    var email = f.email.value.trim();
    ok = setErr(form, "name", /^[A-Za-zÀ-ɏ .'-]{2,80}$/.test(name) ? "" : "Please enter your name.") && ok;
    ok = setErr(form, "phone", validPhone(f.cc.value, phone) ? "" : "Please enter a valid mobile number.") && ok;
    ok = setErr(form, "email", !email || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? "" : "Please check the email address.") && ok;
    ok = setErr(form, "consent", f.consent.checked ? "" : "Please tick the box so we can contact you.") && ok;
    return ok ? { name: name, phone: f.cc.value + phone, email: email } : null;
  }
  function status(form, msg, cls) {
    var s = $(".form-status", form);
    s.className = "form-status" + (cls ? " " + cls : "");
    s.textContent = msg || "";
  }

  function onSubmit(e) {
    e.preventDefault();
    var form = e.currentTarget, id = form.dataset.formId;
    var lead = validate(form);
    if (!lead) { track("form_error", { form_id: id }); return; }
    // Bots: filled honeypot, or submitted within 2.5s of page load.
    if (form.elements.company.value || Date.now() - loadedAt < 2500) { showSuccess(form, id); return; }
    if (!C.leadEndpoint) {
      status(form, "Preview mode: no lead endpoint is set in assets/js/config.js yet, so this enquiry was not sent.", "is-note");
      return;
    }
    var payload = {
      project: "Assetz Mizu & Ki",
      name: lead.name, phone: lead.phone, email: lead.email,
      form_id: id,
      intent: id === "modal" ? modalCtx.intent : "",
      configuration: id === "modal" ? modalCtx.config : "",
      page_url: location.href,
      submitted_at: new Date().toISOString()
    };
    for (var k in attribution) payload[k] = attribution[k];

    // Same number within 30 days: thank them, but don't post a duplicate lead.
    var seen = {};
    try { seen = JSON.parse(store.get("localStorage", "mk_leads") || "{}"); } catch (x) { seen = {}; }
    if (seen[lead.phone] && Date.now() - seen[lead.phone] < 30 * 864e5) { showSuccess(form, id); return; }

    var btn = $(".btn-submit", form), label = btn.textContent;
    btn.disabled = true; btn.textContent = "Sending…"; status(form, "");
    var ctl = new AbortController();
    var timer = setTimeout(function () { ctl.abort(); }, 15000);
    fetch(C.leadEndpoint, {
      method: "POST",
      mode: C.leadEndpointMode === "no-cors" ? "no-cors" : "cors",
      headers: { "Content-Type": C.leadEndpointSimpleRequest || C.leadEndpointMode === "no-cors" ? "text/plain;charset=UTF-8" : "application/json" },
      body: JSON.stringify(payload),
      signal: ctl.signal
    }).then(function (r) {
      if (r.type !== "opaque" && !r.ok) throw new Error("HTTP " + r.status);
      seen[lead.phone] = Date.now();
      store.set("localStorage", "mk_leads", JSON.stringify(seen));
      track("form_submit", { form_id: id, intent: payload.intent });
      showSuccess(form, id);
      if (C.thankYouUrl) location.href = C.thankYouUrl;
    }).catch(function () {
      track("form_error", { form_id: id, reason: "network" });
      status(form, hasPhone ? "We couldn't send that just now. Please try again, or call +91 " + C.phoneDisplay + "." : "We couldn't send that just now. Please try again in a moment.", "is-error");
    }).then(function () {
      clearTimeout(timer); btn.disabled = false; btn.textContent = label;
    });
  }

  function showSuccess(form, id) {
    engaged = true;
    store.set("localStorage", "mk_unlocked", "1");
    unlockPlans();
    var box = document.createElement("div");
    box.className = "form-success";
    box.setAttribute("role", "status");
    box.innerHTML = '<div class="tick"><svg width="22" height="22" aria-hidden="true"><use href="#i-check"/></svg></div><h4>Thank you.</h4><p>Your enquiry is with the Mizu &amp; Ki sales team. Expect a call back shortly with the price sheet, floor plans and site-visit slots.</p>';
    if (C.brochureUrl) {
      var a = document.createElement("a");
      a.className = "btn"; a.href = C.brochureUrl; a.target = "_blank"; a.rel = "noopener"; a.textContent = "Open Brochure";
      box.appendChild(a);
    }
    form.replaceWith(box);
  }

  /* ---------- Gated floor plans ---------- */
  function unlockPlans() { document.documentElement.classList.add("plans-unlocked"); }
  if (store.get("localStorage", "mk_unlocked") === "1") unlockPlans();
  function plansUnlocked() { return document.documentElement.classList.contains("plans-unlocked"); }

  /* ---------- Enquiry popup ---------- */
  var INTENTS = {
    price: { tag: "All-Inclusive Price · Starting ₹4.25 Cr*", title: "Unlock price & floor plans", lede: "Tell us where to send them. A Mizu & Ki sales expert will call you back with the details.", btn: "Get Price Sheet & Floor Plans" },
    cost_sheet: { tag: "All-Inclusive Price · No Hidden Charges", title: "Get the detailed cost sheet", lede: "Share your details and we'll send the complete cost break-up for this villament.", btn: "Get Cost Sheet" },
    floor_plan: { tag: "Unit Plans · Room-Wise Dimensions", title: "Download floor plans", lede: "Share your details to unlock the floor plans. A sales expert will walk you through them.", btn: "Unlock Floor Plans" },
    brochure: { tag: "Brochure · Price Sheet", title: "Download the brochure", lede: "Tell us where to send it. You'll also get the latest price sheet.", btn: "Get Brochure & Price Sheet" },
    site_visit: { tag: "Private Site Visit", title: "Book a private site visit", lede: "Pick up the price sheet and choose a slot that suits you. Our team will confirm on call.", btn: "Get Price Sheet & Site Visit" }
  };
  function openEnquiry(intent, config, source) {
    if (!modal || modal.open) return;
    var it = INTENTS[intent] || INTENTS.price;
    modalCtx = { intent: intent || "price", config: config || "" };
    $(".modal-tag", modal).textContent = it.tag;
    $(".js-modal-title", modal).textContent = config && intent === "cost_sheet" ? "Cost sheet: " + config : it.title;
    $(".js-modal-lede", modal).textContent = it.lede;
    var b = $(".btn-submit", modal);
    if (b) b.textContent = it.btn;
    modal.showModal();
    track("popup_open", { intent: modalCtx.intent, source: source || "cta" });
    var first = $("input[name=name]", modal);
    if (first) first.focus();
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest(".js-open-enquiry");
    if (t) {
      // Once plans are unlocked, a plan card opens the plan itself instead of the form.
      if (t.dataset.plan && plansUnlocked()) { openLightbox([{ src: t.dataset.plan, caption: t.dataset.planCaption || "" }], 0); return; }
      engaged = true;
      track("cta_click", { cta: t.dataset.cta || "" });
      openEnquiry(t.dataset.intent, t.dataset.config, "cta");
      return;
    }
    var c = e.target.closest("[data-cta]");
    if (c) track(c.classList.contains("js-phone") ? "call_click" : c.classList.contains("js-whatsapp") ? "whatsapp_click" : "cta_click", { cta: c.dataset.cta });
    if (e.target.closest("[data-close]")) e.target.closest("dialog").close();
  });
  $$("dialog").forEach(function (d) {
    d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
  });
  var delay = Number(C.popupDelaySeconds) || 0;
  if (delay > 0 && modal && !store.get("sessionStorage", "mk_popup") && store.get("localStorage", "mk_unlocked") !== "1") {
    setTimeout(function () {
      var lb = $("#lightbox");
      if (engaged || (lb && lb.open)) return;
      store.set("sessionStorage", "mk_popup", "1");
      openEnquiry("price", "", "timer");
    }, delay * 1000);
  }

  /* ---------- Lightbox ---------- */
  var lb = $("#lightbox"), lbItems = [], lbIndex = 0;
  function showLb() {
    var it = lbItems[lbIndex];
    $("img", lb).src = it.src; $("img", lb).alt = it.caption;
    $("figcaption", lb).textContent = it.caption;
    $$(".lb-nav", lb).forEach(function (n) { n.hidden = lbItems.length < 2; });
  }
  function openLightbox(items, i) { lbItems = items; lbIndex = i; showLb(); if (!lb.open) lb.showModal(); }
  function stepLb(d) { lbIndex = (lbIndex + d + lbItems.length) % lbItems.length; showLb(); }
  $$(".js-lightbox").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var group = btn.closest(".g-grid");
      var btns = group ? $$(".js-lightbox", group) : [btn];
      openLightbox(btns.map(function (b) { return { src: b.dataset.full, caption: b.dataset.caption || "" }; }), btns.indexOf(btn));
    });
  });
  if (lb) {
    $(".lb-prev", lb).addEventListener("click", function () { stepLb(-1); });
    $(".lb-next", lb).addEventListener("click", function () { stepLb(1); });
    lb.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") stepLb(-1);
      if (e.key === "ArrowRight") stepLb(1);
    });
  }

  /* ---------- Tabs (amenities, location) ---------- */
  function tabs(tabSel, panelSel) {
    var ts = $$(tabSel), ps = $$(panelSel);
    ts.forEach(function (t) {
      t.addEventListener("click", function () {
        ts.forEach(function (x) { var on = x === t; x.classList.toggle("is-active", on); x.setAttribute("aria-selected", on ? "true" : "false"); });
        ps.forEach(function (p) { var on = p.id === t.dataset.target; p.hidden = !on; p.classList.toggle("is-active", on); });
      });
    });
  }
  tabs(".am-tab", ".am-panel");
  tabs(".loc-tab", ".loc-panel");

  /* ---------- Mobile action bar: appears once the hero is scrolled past ---------- */
  var bar = $(".action-bar"), hero = $("#hero");
  if (bar && hero && "IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { bar.classList.toggle("is-visible", !en[0].isIntersecting); }, { threshold: 0 }).observe(hero);
  } else if (bar) { bar.classList.add("is-visible"); }
})();
