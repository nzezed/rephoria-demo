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
} from '@react-email/components';

interface VerificationEmailProps {
  verifyLink: string;
  name?: string;
}

export function VerificationEmail({ verifyLink, name }: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={heading}>Verify Your Email</Text>
            <Text style={paragraph}>
              {name ? `Hi ${name},` : 'Hello,'}
            </Text>
            <Text style={paragraph}>
              Thanks for signing up for Rephoria! Please verify your email address
              by clicking the button below.
            </Text>
            <Button style={button} href={verifyLink}>
              Verify Email
            </Button>
            <Text style={paragraph}>
              This link will expire in 24 hours. If you didn't create an account,
              you can safely ignore this email.
            </Text>
            <Hr style={hr} />
            <Text style={footer}>
              If the button above doesn't work, copy and paste this link into your browser:
              <br />
              <Link href={verifyLink} style={link}>
                {verifyLink}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  padding: '40px 0',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  borderRadius: '5px',
  margin: '0 auto',
  padding: '20px',
  width: '100%',
  maxWidth: '600px',
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#484848',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px',
  margin: '30px 0',
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