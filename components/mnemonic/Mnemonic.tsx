import React, { useState, useEffect } from 'react';
import { Secp256k1HdWallet, AminoSignResponse } from '@cosmjs/amino';
import { Button, Text, Divider, Box } from '@interchain-ui/react';
import { apiVerifyMessage, apiGetAmount } from '../common/api';
import { fromBase64, toUtf8, toBase64 } from '@cosmjs/encoding';
import * as Cosmos from '@keplr-wallet/cosmos';

import { sha256 } from '@cosmjs/crypto';

export const Mnemonic: React.FC = () => {
  const [mnemonic, setMnemonic] = useState('');
  const [error, setError] = useState('');
  const [vdlAddress, setVidulumAddress] = useState('');
  const [vdlPubKey, setVdlPubKey] = useState('');
  const [bzeAddress, setBzeAddress] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [amount, setAmount] = useState(0);
  const [signature, setSignature] = useState('');
  const [fetchFailed, setFetchFailed] = useState(false);

  const generateAddress = async () => {
    try {
      const words = mnemonic.trim().split(/\s+/);
      if (words.length < 12) {
        setError('Invalid mnemonic. Ensure it is a 12 or 24-word phrase.');
        return;
      }
      setError('');

      const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {
        prefix: 'vdl',
      });

      if (!wallet) {
        throw new Error(
          'Error generating address. Ensure the mnemonic is valid.'
        );
      }

      const accounts = await wallet.getAccounts();

      const publicKey = accounts[0].pubkey;
      setVdlPubKey(toBase64(publicKey));

      const vdladdr = accounts[0].address;
      setVidulumAddress(vdladdr);
    } catch (error) {
      setError('Error generating address. Ensure the mnemonic is valid.');
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
    setBzeAddress(address);
  };

  const signMessage = async () => {
    try {
      const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {
        prefix: 'vdl',
      });
      const [account] = await wallet.getAccounts();
      const signDoc = Cosmos.makeADR36AminoSignDoc(
        account.address,
        Buffer.from(sha256(toUtf8(bzeAddress)))
      );
      const signature: AminoSignResponse = await wallet.signAmino(
        account.address,
        signDoc
      );

      const isValid = await verifyMessageLocally(
        'vdl',
        vdlAddress,
        bzeAddress,
        vdlPubKey,
        signature.signature.signature
      );

      if (!isValid) {
        setError('Signature is not valid.');
        return;
      }
      const error = await apiVerifyMessage(
        bzeAddress,
        vdlPubKey,
        signature.signature.signature,
        vdlAddress
      );

      if (error) {
        setError(error);
        return;
      }
      setError('');
      setSignature(signature.signature.signature);
    } catch (err) {
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
      <h2>Mnemonic Phrase</h2>

      {/* Mnemonic Input */}
      <div style={{ width: '500px', display: 'grid' }}>
        <Text as='h4' fontSize='$md' attributes={{ marginBottom: '$4' }}>
          Mnemonic (12 or 24 words):
        </Text>
        <textarea
          id='mnemonic'
          autoComplete='off'
          rows={4}
          value={mnemonic}
          onChange={(e) => setMnemonic(e.target.value)}
          placeholder='Enter your 12 or 24-word mnemonic'
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
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
          <Divider my={'$4'} />
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

      {/* Error Message */}
      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};
