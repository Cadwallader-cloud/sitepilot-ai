import { ServiceIcon } from "@/components/service-icon";

export type IconProps = {
  name?: string;
  className?: string;
  color?: string;
};

export function Icon({ name, className, color }: IconProps) {
  return (
    <span data-component="Icon">
      <ServiceIcon name={name} className={className} color={color} />
    </span>
  );
}
