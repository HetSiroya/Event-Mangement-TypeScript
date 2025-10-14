interface otpDetails {
  name: string;
  otp: string;
}

export const otpMail = (Details: otpDetails) => {
  return `
    <h1>Your OTP Code</h1>
    <p>Dear ${Details.name},</p>
    <p>Your OTP code is: <strong>${Details.otp}</strong
    <p>This code is valid for the next 10 minutes.</p>
    `;
};
