import { useState } from 'react';
import {
  Box,
  Text,
  Icon,
  Stack,
  Button,
  Divider,
  useColorModeValue,
  useTheme,
} from '@interchain-ui/react';
import {
  Layout,
  // Landing,
  Keplr,
  Mnemonic,
  PrivateKey,
  // Confirmation,
  Status,
} from '@/components';

export default function Home() {
  const [currentView, setCurrentView] = useState('wallet');

  const claimOptions = [
    {
      name: 'Vidulum App Users',
      desc: 'I have a private key.',
      path: 'privateKey',
    },
    {
      name: 'Keplr Users',
      desc: 'Connect my wallet.',
      path: 'keplr',
    },
    {
      name: 'Mnemonic Phrase',
      desc: 'I have words with spaces.',
      path: 'mnemonic',
    },
  ];

  const switchView = (view: string) => {
    setCurrentView(view);
  };

  const renderView = () => {
    switch (currentView) {
      case 'keplr':
        return (
          <>
            <Keplr />
            <Divider my='$8' />
          </>
        );
      case 'mnemonic':
        return (
          <>
            <Mnemonic />
            <Divider my='$8' />
          </>
        );
      case 'privateKey':
        return (
          <>
            <PrivateKey />
            <Divider my='$8' />
          </>
        );
      case 'status':
        return (
          <>
            <Status />
            <Divider my='$8' />
          </>
        );
      // case 'confirmation':
      //   return <Confirmation />;
      // default:
      //   return <Landing />;
    }
  };

  function Option({
    option,
  }: {
    option: { name: string; desc: string; path: string };
  }) {
    return (
      <a
        onClick={() => {
          switchView(option.path);
        }}
        className='option'
      >
        <Stack
          space='$1'
          direction='vertical'
          attributes={{
            height: '$20',
            width: '250px',
            padding: '$9',
            justifyContent: 'center',
            borderRadius: '$xl',
            color: {
              base: '$text',
              hover: useColorModeValue('$purple600', '$purple300'),
            },
            boxShadow: {
              base: useColorModeValue(
                '0 2px 5px #ccc',
                '0 1px 3px #727272, 0 2px 12px -2px #2f2f2f'
              ),
              hover: useColorModeValue(
                '0 2px 5px #bca5e9',
                '0 0 3px rgba(150, 75, 213, 0.8), 0 3px 8px -2px rgba(175, 89, 246, 0.9)'
              ),
            },
          }}
        >
          <Text
            as='h2'
            fontSize='$xl'
            color='inherit'
            attributes={{ margin: 0 }}
          >
            {option.name}&ensp;&rarr;
          </Text>
          <Text
            color='inherit'
            as='p'
            fontSize='$md'
            fontWeight='$normal'
            attributes={{ marginY: '$1' }}
          >
            {option.desc}
          </Text>
        </Stack>
      </a>
    );
  }

  return (
    <Layout>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Text
          as='h2'
          fontWeight='$extrabold'
          fontSize={{ mobile: '$6xl', tablet: '$10xl' }}
        >
          Claim VDL
        </Text>

        <Button
          intent='secondary'
          attributes={{
            marginX: '$10',
            alignSelf: 'end',
          }}
          onClick={() => {
            switchView('status');
          }}
        >
          Check Status
        </Button>
      </div>

      <Divider my='$8' />

      {renderView()}

      <Box
        display='grid'
        gridTemplateColumns={{ tablet: 'repeat(3, 1fr)' }}
        gap='$12'
        mb='$8'
      >
        {claimOptions.map((option) => (
          <Option key={option.path} option={option} />
        ))}
      </Box>
      <Divider my='$8' />
    </Layout>
  );
}
