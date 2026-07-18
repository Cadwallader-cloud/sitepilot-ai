export type BusinessFormInput = {
  businessName: string;
  type: string;
  location: string;
  services: string;
  phone: string;
};

export const exampleFormInput: BusinessFormInput = {
  businessName: "ABC Roofing",
  type: "Roof repair company",
  location: "London",
  services: "Roof replacement, gutters, emergency repairs",
  phone: "+44 20 7946 0958",
};
