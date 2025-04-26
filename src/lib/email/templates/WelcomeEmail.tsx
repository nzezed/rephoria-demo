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
} from '@react-email/components';

interface WelcomeEmailProps {
  name?: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={heading}>Welcome to Rephoria!</Text>
            <Text style={paragraph}>
              {name ? `Hi ${name},` : 'Hello,'}
            </Text>
            <Text style={paragraph}>
              Thank you for joining Rephoria! We're excited to help you manage and
              analyze your contact center operations more effectively.
            </Text>
            <Text style={paragraph}>
              Here's what you can do with Rephoria:
            </Text>
            <ul style={list}>
              <li style={listItem}>Connect your contact center platforms</li>
              <li style={listItem}>Monitor real-time metrics and analytics</li>
              <li style={listItem}>Get AI-powered insights and recommendations</li>
              <li style={listItem}>Track agent performance and customer satisfaction</li>
            </ul>
            <Button style={button} href={dashboardLink}>
              Go to Dashboard
            </Button>
            <Hr style={hr} />
            <Text style={footer}>
              If you have any questions or need assistance, don't hesitate to
              reach out to our support team.
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
  margin: '20px 0',
};

const list = {
  margin: '20px 0',
  paddingLeft: '20px',
};

const listItem = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#484848',
  margin: '10px 0',
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