export type BusinessFormInput = {
  businessName: string;
  location: string;
  services: string;
  phone: string;
  email: string;
};

export const exampleFormInput: BusinessFormInput = {
  businessName: "London Roofing",
  location: "London",
  services: "Roof repair, gutter replacement, chimney repair",
  phone: "+44 20 7946 0958",
  email: "hello@londonroofing.co.uk",
};
