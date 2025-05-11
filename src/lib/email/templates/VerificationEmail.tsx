import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';

interface VerificationEmailProps {
  verificationLink: string;
  name?: string;
}

export const VerificationEmail = ({ verificationLink, name }: VerificationEmailProps) => {
  const previewText = `Verify your email for Repload`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Verify Your Email</Heading>
          <Text style={text}>
            {name ? `Hi ${name},` : 'Hi there,'}
          </Text>
          <Text style={text}>
            Thanks for signing up for Repload! Please verify your email address by clicking the button below:
          </Text>
          <Button style={button} href={verificationLink}>
            Verify Email
          </Button>
          <Text style={text}>
            If you didn't create an account with Repload, you can safely ignore this email.
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

export default VerificationEmail; 