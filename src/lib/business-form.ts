export type BusinessFormInput = {
  businessName: string;
  category: string;
  location: string;
  description: string;
  services: string;
  phone: string;
  email: string;
};

export const exampleFormInput: BusinessFormInput = {
  businessName: "Apex Roofing",
  category: "Roofing",
  location: "Dallas",
  description:
    "Residential roofing company serving Dallas homeowners with repairs, replacements, and storm damage work.",
  services: "Roof repair, roof replacement, storm damage, inspections",
  phone: "+1 214 555 0199",
  email: "hello@apexroofing.example",
};
