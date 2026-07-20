"use client";

import { UpgradePlans } from "@/components/upgrade-plans";

type CheckoutButtonProps = {
  businessName?: string;
  projectId?: string;
};

/** @deprecated Prefer UpgradePlans — kept for any leftover imports */
export function CheckoutButton({
  businessName,
  projectId,
}: CheckoutButtonProps) {
  return (
    <UpgradePlans projectId={projectId} businessName={businessName} />
  );
}
