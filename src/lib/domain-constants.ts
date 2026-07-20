/** Public DNS instructions shown to customers (Stage 1). */
export const CUSTOM_DOMAIN_CNAME = {
  type: "CNAME" as const,
  host: "www",
  value: "cname.vercel-dns.com",
};

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
  dns_connected: "Connected",
  vercel_pending: "Attaching to hosting…",
  ssl_pending: "Provisioning SSL…",
  ssl_active: "Live with SSL",
  error: "Needs attention",
};
