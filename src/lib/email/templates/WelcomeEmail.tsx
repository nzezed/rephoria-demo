import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Heading,
  Link,
  Preview,
} from '@react-email/components';

interface WelcomeEmailProps {
  name?: string;
}

export const WelcomeEmail = ({ name }: WelcomeEmailProps) => {
  const previewText = `Welcome to Repload!`;
  const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to Repload!</Heading>
          <Text style={text}>
            {name ? `Hi ${name},` : 'Hi there,'}
          </Text>
          <Text style={text}>
            Thank you for joining Repload! We're excited to help you manage and
            optimize your sales calls with AI-powered insights.
          </Text>
          <Text style={text}>
            Here's what you can do with Repload:
          </Text>
          <ul style={list}>
            <li style={listItem}>Connect your call platform</li>
            <li style={listItem}>Get AI-powered call insights</li>
            <li style={listItem}>Track performance metrics</li>
            <li style={listItem}>Improve your sales process</li>
          </ul>
          <Text style={text}>
            If you have any questions, feel free to reply to this email.
          </Text>
          <Text style={text}>
            Best regards,
            <br />
            The Repload Team
          </Text>
          <Button style={button} href={dashboardLink}>
            Go to Dashboard
          </Button>
          <Hr style={hr} />
          <Text style={footer}>
            If you have any questions or need assistance, don't hesitate to
            reach out to our support team.
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

const list = {
  color: '#444',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '16px 0',
  paddingLeft: '20px',
};

const listItem = {
  margin: '8px 0',
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

export default WelcomeEmail; 