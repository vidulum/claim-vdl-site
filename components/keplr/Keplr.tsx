import {
  Box,
  Button,
  Divider,
  Stack,
  Text,
  useColorModeValue,
} from '@interchain-ui/react';
import { useState, useEffect } from 'react';
import { apiVerifyMessage, apiGetAmount } from '../common/api';
import { fromBase64, toUtf8 } from 'cosmwasm';
import * as Cosmos from '@keplr-wallet/cosmos';
import { sha256 } from '@cosmjs/crypto';

export function Keplr() {
  const [bzeAddress, setBzeAddress] = useState('');
  const [vdlAddress, setVidulumAddress] = useState('');
  const [amount, setAmount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [signature, setSignature] = useState('');
  const [error, setError] = useState('');
  const [wallet, setWallet] = useState<any>();
  const [fetchFailed, setFetchFailed] = useState(false);

  useEffect(() => {
    window.addEventListener('keplr_keystorechange', handleKeplrAccountChange);

    if (!isConnected) {
      connectKeplr();
    }
  }, []);

  useEffect(() => {
    const fetchAmount = async () => {
      const { error, amount } = await apiGetAmount(vdlAddress);
      if (error) {
        setFetchFailed(true);
        setError(error);
        return;
      }
      setFetchFailed(false);
      setError('');
      if (amount) setAmount(amount);
    };
    if (vdlAddress) fetchAmount();
  }, [vdlAddress]);

  const handleKeplrAccountChange = () => {
    connectKeplr();
  };

  const connectKeplr = async () => {
    if (!window.keplr) {
      setError('Keplr extension is not installed');
      return;
    }

    try {
      const chainId = 'vidulum-1';
      await window.keplr.enable(chainId);
      const offlineSigner = window.keplr.getOfflineSigner(chainId);
      const accounts = await offlineSigner.getAccounts();
      setWallet(accounts);
      setVidulumAddress(accounts[0].address);
      setIsConnected(true);
      setError('');
    } catch (err) {
      setError('Failed to connect to Keplr');
    }
  };

  const handleConnect = () => {
    setIsConnected(false);
    connectKeplr();
  };

  const handleDisconnect = () => {
    setVidulumAddress('');
    setIsConnected(false);
  };

  const validateBzeAddress = (address: string) => {
    if (!address.startsWith('bze1')) {
      setError('Invalid BZE address.');
    } else {
      setError('');
      setBzeAddress(address);
    }
  };

  const signMessage = async () => {
    if (!vdlAddress) {
      setError('Please connect to Keplr first.');
      return;
    }

    if (!bzeAddress) {
      setError('Please enter a valid BZE address.');
      return;
    }

    try {
      const chainId = 'vidulum-1';
      const signResponse = await window.keplr.signArbitrary(
        chainId,
        vdlAddress,
        Buffer.from(sha256(toUtf8(bzeAddress)))
      );

      function uint8ArrayToBase64(uint8Array: any) {
        return Buffer.from(uint8Array).toString('base64');
      }

      const vdlPubKey = uint8ArrayToBase64(wallet[0].pubkey);

      const isValid = await verifyMessageLocally(
        'vdl',
        vdlAddress,
        bzeAddress,
        vdlPubKey,
        signResponse.signature
      );

      if (isValid) {
        const verified = await apiVerifyMessage(
          bzeAddress,
          vdlPubKey,
          signResponse.signature,
          vdlAddress
        );

        if (!verified) {
          setError('Failed to verify the message.');
        } else {
          setError('');
          setSignature(signResponse.signature);
        }
      } else {
        setError('Signature verification failed.');
      }
    } catch (err) {
      console.log(err);
      setError('Failed to sign the message.');
    }
  };

  const verifyMessageLocally = async (
    prefix: string,
    address: string,
    message: string,
    pubKeyBase64: string,
    signatureBase64: string
  ) => {
    {
      try {
        return Cosmos.verifyADR36Amino(
          prefix,
          address,
          Buffer.from(sha256(toUtf8(message))),
          fromBase64(pubKeyBase64),
          fromBase64(signatureBase64)
        );
      } catch (error) {
        console.error('Error verifying signature:', error);
      }
    }
  };

  return (
    <div style={{ display: 'block', margin: '20px' }}>
      <Stack
        direction='vertical'
        attributes={{
          mx: 'auto',
          px: '$8',
          py: '$15',
          maxWidth: '27rem',
          borderRadius: '$lg',
          textAlign: 'center',
          backgroundColor: useColorModeValue('$white', '$blackAlpha500'),
          boxShadow: useColorModeValue(
            '0 0 2px #dfdfdf, 0 0 6px -2px #d3d3d3',
            '0 0 2px #363636, 0 0 8px -2px #4f4f4f'
          ),
        }}
      >
        {vdlAddress ? (
          <Text className='m-2'>
            Connected with address: <strong>{vdlAddress}</strong>
          </Text>
        ) : (
          <Text>No Keplr connection</Text>
        )}

        <Box my='$8' display={'ruby'}>
          {isConnected ? (
            <Button onClick={handleDisconnect} intent='secondary'>
              Disconnect Keplr
            </Button>
          ) : (
            <Button onClick={handleConnect} intent='primary'>
              Connect Keplr
            </Button>
          )}
        </Box>
      </Stack>

      {vdlAddress ? (
        <>
          <Divider my='$4' />
          <div style={{ display: 'block', width: '100%', margin: '20px' }}>
            <h3 style={{ margin: '20px' }}>
              Claim Amount:{' '}
              {amount
                ? amount + ' VDL'
                : fetchFailed
                ? 'Try Again Later'
                : 'No VDL Found'}
            </h3>
          </div>
        </>
      ) : null}

      {amount ? (
        <>
          <Divider my='$4' />
          <div style={{ display: 'block', width: '100%', margin: '20px' }}>
            <Text attributes={{ marginRight: '$4', fontSize: '$4' }}>
              <strong>BZE Address:</strong>
            </Text>
            <input
              type='text'
              id='bzeAddress'
              value={bzeAddress}
              onChange={(e) => validateBzeAddress(e.target.value)}
              placeholder='Enter your BZE address'
              autoComplete='off'
              style={{
                height: '40px',
                width: '450px',
                fontSize: '16px',
                padding: '8px',
                marginBottom: '10px',
                display: 'flex',
              }}
            />

            <Button
              onClick={signMessage}
              attributes={{ display: 'flex', margin: '$4', width: '200px' }}
            >
              Sign and Submit
            </Button>
          </div>
        </>
      ) : null}

      {/* Signed Message Display */}
      {signature && (
        <>
          <Divider my='$4' />
          <div
            style={{
              marginTop: '20px',
              background: '#000000',
              padding: '25px',
              width: '800px',
            }}
          >
            <Text fontSize='lg' fontWeight='bold' color='green'>
              Good Claim! Your claim has been submitted. Save this
            </Text>

            <Box p='$4' bg='gray.700' borderRadius='$md' mt='4'>
              <Text fontWeight='bold'>Vidulum Address (VDL):</Text>
              <Text>{vdlAddress}</Text>
            </Box>

            <Box p='$4' bg='gray.700' borderRadius='$md' mt='4'>
              <Text fontWeight='bold'>BeeZee Address (BZE):</Text>
              <Text>{bzeAddress}</Text>
            </Box>

            <Box p='$4' bg='gray.700' borderRadius='$md' mt='4'>
              <Text fontWeight='bold'>Signature (Proof of ownership):</Text>
              <Text>{signature}</Text>
            </Box>

            <Text color='red' fontWeight='bold'>
              Important: Save this information securely. It cannot be recovered
              later.
            </Text>
          </div>
        </>
      )}

      {error && (
        <Text color='red' attributes={{ marginTop: '10px' }}>
          {error}
        </Text>
      )}
    </div>
  );
}
