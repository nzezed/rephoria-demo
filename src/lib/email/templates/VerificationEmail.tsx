import * as React from 'react';

interface VerificationEmailProps {
  verifyLink: string;
  name?: string;
}

export function VerificationEmail({ verifyLink, name }: VerificationEmailProps) {
  return (
    <div>
      <h1>Verify Your Email</h1>
      {name && <p>Hello {name},</p>}
      <p>Please verify your email address by clicking the link below:</p>
      <a href={verifyLink}>{verifyLink}</a>
      <p>If you didn't create an account with us, you can safely ignore this email.</p>
    </div>
  );
} 