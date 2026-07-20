import { resolveCname } from "node:dns/promises";
import { CUSTOM_DOMAIN_CNAME } from "@/lib/domain-constants";
import { normalizeCustomDomain } from "@/lib/tenancy";

const EXPECTED = CUSTOM_DOMAIN_CNAME.value.toLowerCase().replace(/\.$/, "");

export type DnsVerifyResult = {
  ok: boolean;
  status: "Connected" | "Waiting for DNS";
  hostChecked: string;
  expected: string;
  found: string[];
  message: string;
};

/**
 * Stage 2 — check that www.<apex> has CNAME → cname.vercel-dns.com
 */
export async function verifyCustomDomainCname(
  apexOrWww: string,
): Promise<DnsVerifyResult> {
  const apex = normalizeCustomDomain(apexOrWww);
  const hostChecked = `www.${apex}`;

  try {
    const records = await resolveCname(hostChecked);
    const found = records.map((r) => r.toLowerCase().replace(/\.$/, ""));
    const ok = found.some(
      (r) => r === EXPECTED || r.endsWith(`.${EXPECTED}`),
    );

    return {
      ok,
      status: ok ? "Connected" : "Waiting for DNS",
      hostChecked,
      expected: EXPECTED,
      found,
      message: ok
        ? `CNAME on ${hostChecked} points to ${EXPECTED}.`
        : found.length
          ? `Found CNAME ${found.join(", ")} — expected ${EXPECTED}.`
          : `No CNAME found on ${hostChecked} yet. DNS can take a few minutes.`,
    };
  } catch (err) {
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code?: string }).code)
        : "";
    return {
      ok: false,
      status: "Waiting for DNS",
      hostChecked,
      expected: EXPECTED,
      found: [],
      message:
        code === "ENODATA" || code === "ENOTFOUND"
          ? `No CNAME found on ${hostChecked} yet. Add the record and try again.`
          : `Could not look up DNS for ${hostChecked}. Try again shortly.`,
    };
  }
}
