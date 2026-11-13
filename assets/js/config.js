/* Assetz Mizu & Ki — site settings. Fill these in before going live.
   Anything left empty is simply switched off on the page. */
window.SS_CONFIG = {
  // Lead delivery: webhook that receives each enquiry as JSON (Pabbly, Leadrat, Apps Script...).
  leadEndpoint: "",
  leadEndpointMode: "cors",          // "cors" or "no-cors"
  leadEndpointSimpleRequest: false,   // true = send as text/plain (avoids a CORS preflight)
  thankYouUrl: "",                    // optional redirect after a successful enquiry

  // Tracking
  gtmId: "",                          // e.g. "GTM-XXXXXXX"
  callConversionSendTo: "",           // e.g. "AW-123456789/AbCdEf"

  // Sales contact
  phoneDisplay: "",                   // e.g. "98765 43210"
  phoneE164: "",                      // e.g. "+919876543210"
  whatsappNumber: "",                 // e.g. "919876543210"
  whatsappMessage: "Hi, I'd like the price sheet and floor plans for Assetz Mizu & Ki.",

  // Behaviour
  popupDelaySeconds: 25,              // 0 turns the timed popup off
  brochureUrl: "",                    // optional: opened after a brochure enquiry

  // Compliance
  partnerName: "",                    // authorised channel partner's legal name
  agentRera: "",                      // channel partner's agent RERA number
  consentEntity: "Assetz Property Group and its authorised sales partners",
  siteUrl: "",
  privacyUrl: ""
};
