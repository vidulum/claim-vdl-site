import {
  Box,
  Icon,
  Link,
  Stack,
  Text,
  useColorModeValue,
} from '@interchain-ui/react';

export type Project = {
  name: string;
  desc: string;
  link: string;
  important: boolean;
};

export const supporters: Project[] = [
  {
    name: 'Cosmos Network',
    desc: 'Build on the Interchain',
    link: 'https://cosmos.network/',
    important: false,
  },
  {
    name: 'BeeZee Network',
    desc: 'The hub of Simplified DeFi',
    link: 'https://getbze.com/',
    important: true,
  },
  {
    name: 'CoinGecko',
    desc: 'Prices by Market Cap',
    link: 'https://www.coingecko.com/en/coins/vidulum',
    important: false,
  },
];

function Dependency({ name, desc, link, important }: Project) {
  return (
    <Link href={link} target='_blank' underline={false}>
      <Stack
        key={name}
        space='$6'
        direction='horizontal'
        attributes={{
          height: '$full',
          padding: '$8',
          justifyContent: 'center',
          borderWidth: important ? '3px' : '1px',
          borderStyle: 'solid',
          borderColor: important ? '#fff' : '#000000',
          borderRadius: '$xl',
          boxShadow: {
            base: 'none',
            hover: useColorModeValue(
              '0 2px 5px #ccc',
              '0 1px 3px #727272, 0 2px 12px -2px #2f2f2f'
            ),
          },
        }}
      >
        <Box
          color={useColorModeValue('$primary500', '$primary200')}
          flex='0 0 auto'
        >
          <Icon name='link' size='$md' attributes={{ mt: '$2' }} />
        </Box>

        <Stack space='$2' direction='vertical'>
          <Text
            as='p'
            fontSize='$lg'
            fontWeight='$semibold'
            attributes={{ marginY: '$1' }}
          >
            {name}
          </Text>
          <Text
            as='p'
            fontSize='$md'
            fontWeight='$light'
            attributes={{
              color: useColorModeValue('$blackAlpha700', '$whiteAlpha700'),
              lineHeight: '$short',
              marginY: '$1',
            }}
          >
            {desc}
          </Text>
        </Stack>
      </Stack>
    </Link>
  );
}

export function Footer() {
  return (
    <>
      <Box
        display='grid'
        gridTemplateColumns={{ tablet: 'repeat(3, 1fr)' }}
        gap='$12'
        mb='$19'
      >
        {supporters.map((supporter) => (
          <Dependency key={supporter.name} {...supporter}></Dependency>
        ))}
      </Box>
    </>
  );
}
