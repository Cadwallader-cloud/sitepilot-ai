import NextImage from "next/image";
import type { SizeToken } from "./tokens";
import { radius, size as sizeToken } from "./tokens";

export type AvatarSize = Extract<SizeToken, "avatarSm" | "avatarMd" | "avatarLg">;

export type AvatarProps = {
  src?: string;
  alt?: string;
  initials?: string;
  size?: AvatarSize;
  className?: string;
};

const avatarSizeClass: Record<AvatarSize, string> = {
  avatarSm: sizeToken.avatarSm,
  avatarMd: sizeToken.avatarMd,
  avatarLg: sizeToken.avatarLg,
};

export function Avatar({
  src,
  alt = "",
  initials,
  size = "avatarMd",
  className = "",
}: AvatarProps) {
  if (src) {
    return (
      <span
        className={`relative inline-block overflow-hidden ${radius.full} ${avatarSizeClass[size]} ${className}`.trim()}
        data-component="Avatar"
      >
        <NextImage src={src} alt={alt} fill className="object-cover" />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center bg-zinc-200 font-semibold uppercase text-zinc-700 ${radius.full} ${avatarSizeClass[size]} ${className}`.trim()}
      data-component="Avatar"
      aria-label={alt || initials}
    >
      {initials?.slice(0, 2) ?? "?"}
    </span>
  );
}
