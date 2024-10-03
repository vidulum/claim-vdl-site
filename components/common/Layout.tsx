import Head from 'next/head';
import { Container } from '@interchain-ui/react';
import { Footer } from './Footer';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Container maxWidth='64rem' attributes={{ py: '$14' }}>
      <Head>
        <title>Claim VDL</title>
        <meta name='description' content='claim vdl' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      {children}
      <Footer />
    </Container>
  );
}
