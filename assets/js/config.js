/* Assetz Mizu & Ki — site settings. Fill these in before going live.
   Anything left empty is simply switched off on the page. */
window.SS_CONFIG = {
  // Lead delivery: webhook that receives each enquiry as JSON (Pabbly, Leadrat, Apps Script...).
  leadEndpoint: "https://connect.pabbly.com/webhook-listener/webhook/IjU3NjUwNTY1MDYzNTA0MzY1MjZjNTUzNyI_3D_pc/IjU3NjcwNTZiMDYzNTA0MzE1MjY5NTUzMjUxMzUi_pc",
  leadEndpointMode: "form",          // "form" (URL-encoded, for Pabbly), "cors" (JSON) or "no-cors"
  leadEndpointSimpleRequest: false,   // true = send as text/plain (avoids a CORS preflight)
  thankYouUrl: "thank-you.html",                    // optional redirect after a successful enquiry

  // Tracking
  gtmId: "",                          // leave empty: GTM-K2DVVNWZ is installed directly in the <head> of index.html
  callConversionSendTo: "",           // e.g. "AW-123456789/AbCdEf"

  // Sales contact
  phoneDisplay: "76766 65738",        // e.g. "98765 43210"
  phoneE164: "+917676665738",         // e.g. "+919876543210"
  whatsappNumber: "917676665738",     // e.g. "919876543210"
  whatsappMessage: "Hi, I'd like the price sheet and floor plans for Assetz Mizu & Ki.",

  // Behaviour
  popupDelaySeconds: 25,              // 0 turns the timed popup off
  brochureUrl: "",                    // optional: opened after a brochure enquiry

  // Compliance
  partnerName: "Buildnest Realty Pvt Ltd", // authorised channel partner's legal name
  agentRera: "PRM/KA/RERA/1251/446/AG/210729/002406", // channel partner's agent RERA number
  consentEntity: "Assetz Property Group and its authorised sales partners",
  siteUrl: "https://mizuandki.assetzproperties.in/",
  privacyUrl: "privacy.html"
};
