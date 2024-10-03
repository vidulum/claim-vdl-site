import React, { useState, useEffect } from 'react';
import * as bip39 from 'bip39';
import * as bip32 from 'bip32';
import * as bech32 from 'bech32';
import { Button, Text, Box, Divider } from '@interchain-ui/react';
import { apiVerifyMessage, apiGetAmount } from '../common/api';
import { sha256 } from '@cosmjs/crypto';
import { fromBase64, toUtf8, toBase64 } from '@cosmjs/encoding';
import { Secp256k1Wallet, AminoSignResponse } from '@cosmjs/amino';
import * as Cosmos from '@keplr-wallet/cosmos';

export const PrivateKey: React.FC = () => {
  const [privateKey, setPrivateKey] = useState('');
  const [bzeAddress, setBzeAddress] = useState('');
  const [vdlAddress, setVidulumAddress] = useState('');
  const [error, setError] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [amount, setAmount] = useState(0);
  const [signature, setSignature] = useState('');
  const [fetchFailed, setFetchFailed] = useState(false);

  const generateAddress = async () => {
    try {
      if (!privateKey || privateKey.length !== 64) {
        setError(
          'Invalid private key. Ensure it is a 64-character hex string.'
        );
        return;
      }
      setError('');

      const seed = bip39.mnemonicToSeed(privateKey);
      const node = bip32.fromSeed(seed);
      const path = "m/44'/118'/0'/0/0";
      const child = node.derivePath(path);
      const words = bech32.toWords(child.identifier);
      const address = bech32.encode('vdl', words);
      setVidulumAddress(address);
    } catch (error) {
      setError('Error generating address. Ensure the private key is valid.');
    }
  };

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

  const validateBzeAddress = (address: string) => {
    if (!address.startsWith('bze1')) {
      setError('Invalid BZE address.');
      return;
    }
    setError('');
    setBzeAddress(address);
  };

  const signMessage = async () => {
    try {
      if (!vdlAddress || !bzeAddress) {
        setError('Vidulum or BeeZee address is missing.');
        return;
      }
      setError('');

      const seed = bip39.mnemonicToSeed(privateKey);
      const node = bip32.fromSeed(seed);
      const path = "m/44'/118'/0'/0/0";
      const child = node.derivePath(path);

      if (!child.privateKey) {
        throw new Error('Invalid private key');
      }

      const wallet = await Secp256k1Wallet.fromKey(child.privateKey, 'vdl');

      const [accounts] = await wallet.getAccounts();

      const signDoc = Cosmos.makeADR36AminoSignDoc(
        vdlAddress,
        Buffer.from(sha256(toUtf8(bzeAddress)))
      );

      const signature: AminoSignResponse = await wallet.signAmino(
        vdlAddress,
        signDoc
      );

      const isValid = await verifyMessageLocally(
        'vdl',
        vdlAddress,
        bzeAddress,
        toBase64(accounts.pubkey),
        signature.signature.signature
      );

      if (isValid) {
        const verified = await apiVerifyMessage(
          bzeAddress,
          toBase64(accounts.pubkey),
          signature.signature.signature,
          vdlAddress
        );

        if (!verified) {
          setError('Failed to verify the message.');
        } else {
          setError('');
          setSignature(signature.signature.signature);
        }
      } else {
        setError('Signature verification failed.');
      }
    } catch (error) {
      setError('Signature verification failed.');
      console.log('Error signing message:', error);
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
      <h2>Private Key</h2>

      {/* Mnemonic Input */}
      <div style={{ width: '500px', display: 'grid' }}>
        <Text as='h4' fontSize='$md' attributes={{ marginBottom: '$4' }}>
          Private Key (64-character hex):
        </Text>
        <input
          type='text'
          id='privateKey'
          autoComplete='off'
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          placeholder='Enter your private key'
          style={{
            width: '500px',
            height: '40px',
            fontSize: '16px',
            padding: '8px',
          }}
        />
        <Button
          onClick={generateAddress}
          attributes={{ display: 'flex', margin: '$4', width: '200px' }}
        >
          Generate Address
        </Button>
      </div>

      {/* Vidulum Address Display */}
      {vdlAddress && (
        <>
          <Divider my='$4' />
          <div
            style={{
              display: 'block',
              width: '100%',
              marginTop: '20px',
              marginBottom: '20px',
            }}
          >
            <Text
              as='h4'
              fontSize='$md'
              attributes={{ marginBottom: '$4', marginRight: '$4' }}
            >
              Vidulum Address:
            </Text>
            <Text fontSize='$md' fontWeight='$medium' lineHeight='$tall'>
              {vdlAddress}
            </Text>
            <Button
              onClick={() => {
                setIsConfirmed(true);
              }}
              attributes={{ display: 'flex', margin: '$4', width: '200px' }}
            >
              Confirm Address
            </Button>
          </div>
        </>
      )}

      {isConfirmed && (
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
      )}

      {/* BeeZee Address Input */}
      {amount && isConfirmed ? (
        <>
          <Divider my='$4' />
          <div style={{ display: 'block', width: '100%', margin: '20px' }}>
            <Text attributes={{ marginRight: '$4', fontSize: '$4' }}>
              <strong>BZE Address:</strong>
            </Text>
          </div>

          <input
            type='text'
            id='bzeAddress'
            value={bzeAddress}
            onChange={(e) => validateBzeAddress(e.target.value)}
            placeholder='Enter your BZE address'
            autoComplete='off'
            style={{
              height: '40px',
              width: '500px',
              fontSize: '16px',
              padding: '8px',
            }}
          />

          <Button
            onClick={signMessage}
            attributes={{ display: 'flex', margin: '$4', width: '200px' }}
          >
            Sign and Submit
          </Button>
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

      {/* Error Display */}
      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};
