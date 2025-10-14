interface WelcomeDetails {
  name: string;
}

export const welcomeMail = (Details: WelcomeDetails) => {
  return `
    <h1>Welcome to Our Service</h1>
    <p>Thank you for registering, ${Details.name}!</p>
    <p>We're excited to have you on board.</p>
    `;
};
