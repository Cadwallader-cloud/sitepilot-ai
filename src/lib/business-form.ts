export type BusinessFormInput = {
  businessName: string;
  type: string;
  location: string;
  services: string;
  phone: string;
  description: string;
};

export const exampleFormInput: BusinessFormInput = {
  businessName: "ABC Roofing",
  type: "Roof repair company",
  location: "London",
  services: "Roof replacement, gutters, emergency repairs",
  phone: "+44 20 7946 0958",
  description:
    "Family-run roofing company specializing in storm damage, slate and tile roofs, and same-week emergency call-outs across Greater London.",
};
