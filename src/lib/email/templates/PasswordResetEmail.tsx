import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Link,
  Hr,
  Preview,
  Heading,
} from '@react-email/components';

interface PasswordResetEmailProps {
  resetLink: string;
  name?: string;
}

export const PasswordResetEmail = ({ resetLink, name }: PasswordResetEmailProps) => {
  const previewText = `Reset your password for Repload`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Reset Your Password</Heading>
          <Text style={text}>
            {name ? `Hi ${name},` : 'Hi there,'}
          </Text>
          <Text style={text}>
            We received a request to reset your password for your Repload account.
            Click the button below to reset your password:
          </Text>
          <Button style={button} href={resetLink}>
            Reset Password
          </Button>
          <Text style={text}>
            If you didn't request this, you can safely ignore this email.
            Your password will remain unchanged.
          </Text>
          <Text style={text}>
            Best regards,
            <br />
            The Repload Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.3',
  padding: '16px 0',
};

const text = {
  color: '#444',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '16px 0',
};

const button = {
  backgroundColor: '#ff4f58',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px',
};

const hr = {
  borderColor: '#f0f0f0',
  margin: '30px 0',
};

const footer = {
  fontSize: '14px',
  color: '#9ca3af',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
};

export default PasswordResetEmail; 