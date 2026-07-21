/** Public DNS instructions shown to customers (Stage 1). */
export const CUSTOM_DOMAIN_CNAME = {
  type: "CNAME" as const,
  host: "www",
  value: "cname.vercel-dns.com",
};

/** Product flow shown in the Connect Domain wizard. */
export const CUSTOM_DOMAIN_FLOW_STEPS = [
  "Domain",
  "DNS Instructions",
  "Verify",
  "SSL",
  "Connected",
] as const;

export type CustomDomainFlowStep = (typeof CUSTOM_DOMAIN_FLOW_STEPS)[number];

export type DomainConnectionStatus =
  | "none"
  | "waiting_dns"
  | "dns_connected"
  | "vercel_pending"
  | "ssl_pending"
  | "ssl_active"
  | "error";

export const DOMAIN_STATUS_LABELS: Record<DomainConnectionStatus, string> = {
  none: "Not connected",
  waiting_dns: "Waiting for DNS",
  dns_connected: "DNS verified",
  vercel_pending: "Attaching to hosting…",
  ssl_pending: "Provisioning SSL…",
  ssl_active: "Connected",
  error: "Needs attention",
};

/** Map backend status → wizard step (1–5). */
export function customDomainFlowStep(
  status: DomainConnectionStatus,
): 1 | 2 | 3 | 4 | 5 {
  switch (status) {
    case "none":
      return 1;
    case "waiting_dns":
      return 2;
    case "dns_connected":
    case "vercel_pending":
      return 3;
    case "ssl_pending":
      return 4;
    case "ssl_active":
      return 5;
    case "error":
      return 2;
    default:
      return 1;
  }
}
