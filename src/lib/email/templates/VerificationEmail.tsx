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
  Section,
  Text,
} from '@react-email/components';

interface VerificationEmailProps {
  verifyLink: string;
  name?: string;
}

export function VerificationEmail({ verifyLink, name }: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address for Rephoria</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Verify Your Email</Heading>
          
          {name && (
            <Text style={text}>Hello {name},</Text>
          )}
          
          <Text style={text}>
            Thanks for signing up for Rephoria! Please verify your email address by clicking the button below:
          </Text>
          
          <Section style={buttonContainer}>
            <Button style={button} href={verifyLink}>
              Verify Email Address
            </Button>
          </Section>
          
          <Text style={text}>
            If the button doesn't work, you can also click this link:
            <br />
            <Link href={verifyLink} style={link}>
              {verifyLink}
            </Link>
          </Text>
          
          <Text style={footer}>
            If you didn't create an account with us, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  padding: '60px 0',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  borderRadius: '5px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  margin: '0 auto',
  maxWidth: '600px',
  padding: '40px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '32px',
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const text = {
  color: '#4a4a4a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 20px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '5px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '50px',
  textAlign: 'center' as const,
  textDecoration: 'none',
  width: '220px',
};

const link = {
  color: '#5469d4',
  textDecoration: 'underline',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '40px 0 0',
  textAlign: 'center' as const,
}; 