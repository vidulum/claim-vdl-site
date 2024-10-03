import React, { useState, useEffect } from 'react';
import { Box, Stack, Text, Button, Icon } from '@interchain-ui/react';
import { apiGetStatus } from '../common/api';

interface StatusResponse {
  status: {
    txid?: string;
    submit?: string;
    complete?: string;
  };
  bzeAddress: string;
  amount: string;
}

export function Status() {
  const [vdlAddress, setVidulumAddress] = useState('');
  const [statusInfo, setStatusInfo] = useState<StatusResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const pathParts = currentUrl.pathname.split('/');
    const vdlAddressFromUrl = pathParts[pathParts.length - 1];
    if (vdlAddressFromUrl) {
      setVidulumAddress(vdlAddressFromUrl);
    }
  }, []);

  const fetchStatus = async () => {
    setError('');
    if (!vdlAddress) {
      setError('Please enter a VDL address.');
      return;
    }

    try {
      const response = await apiGetStatus(vdlAddress);
      if (!response) {
        throw new Error('Error fetching status.');
      }

      setStatusInfo(response);
    } catch (err) {
      setError(
        'Error fetching status. Please ensure the VDL address is correct.'
      );
      setStatusInfo(null);
    }
  };

  const renderStatusIcon = (statusDate: string | undefined) => {
    if (statusDate) {
      return (
        <Icon
          name='checkboxCircle'
          color='green.500'
          attributes={{ mr: '$2' }}
        />
      );
    }
    return (
      <Icon name='timeLine' color='yellow.500' attributes={{ mr: '$2' }} />
    );
  };

  return (
    <Box px='$6' py='$8' mx='auto' maxWidth='600px'>
      {/* Conditionally render this text only if vdlAddress exists */}
      {vdlAddress && (
        <Text as='h4' fontSize='$md' attributes={{ marginBottom: '$4' }}>
          Check stats of VDL address
        </Text>
      )}

      {/* VDL Address Input */}
      <Stack direction='vertical' attributes={{ mb: '$6' }}>
        <input
          placeholder='Enter your VDL address'
          value={vdlAddress}
          style={{
            height: '40px',
            fontSize: '16px',
            padding: '8px',
          }}
          onChange={(e) => setVidulumAddress(e.target.value)}
        />
        <Button onClick={fetchStatus} attributes={{ margin: '$6' }}>
          Check Status
        </Button>
      </Stack>

      {/* Error Message */}
      {error && (
        <Text color='red.500' attributes={{ marginBottom: '$4' }}>
          {error}
        </Text>
      )}

      {/* Status Display */}
      {statusInfo && (
        <Box>
          <Text
            fontSize='$lg'
            fontWeight='$semibold'
            attributes={{ marginBottom: '$4' }}
          >
            VDL Address: {vdlAddress}
          </Text>

          {/* BZE Address */}
          <Stack
            direction='horizontal'
            attributes={{ my: '$4', alignItems: 'center' }}
          >
            <Text fontSize='$lg' fontWeight='$semibold'>
              BZE Address:
            </Text>
            <Text fontSize='$md' attributes={{ ml: '$4' }}>
              {statusInfo.bzeAddress}
            </Text>
          </Stack>

          {/* VDL Amount */}
          <Stack
            direction='horizontal'
            attributes={{ my: '$4', alignItems: 'center' }}
          >
            <Text fontSize='$lg' fontWeight='$semibold'>
              VDL Amount:
            </Text>
            <Text fontSize='$md' attributes={{ ml: '$4' }}>
              {statusInfo.amount}
            </Text>
          </Stack>

          {/* Submit Status */}
          <Stack
            direction='horizontal'
            attributes={{ my: '$4', ml: '$4', alignItems: 'center' }}
          >
            {renderStatusIcon(statusInfo.status.submit)}
            <Text fontSize='$lg'>Submit</Text>
            {statusInfo.status.submit && (
              <Text fontSize='$md' attributes={{ ml: '$4' }}>
                {new Date(statusInfo.status.submit).toLocaleDateString()}
              </Text>
            )}
          </Stack>

          {/* Complete Status */}
          <Stack
            direction='horizontal'
            attributes={{ mb: '$4', ml: '$12', alignItems: 'center' }}
          >
            {renderStatusIcon(statusInfo.status.complete)}
            <Text fontSize='$lg'>Complete</Text>
            {statusInfo.status.complete && (
              <Text fontSize='$md' attributes={{ ml: '$4' }}>
                {new Date(statusInfo.status.complete).toLocaleDateString()}
              </Text>
            )}
          </Stack>

          {/* Claimed TXID */}
          <Stack
            direction='horizontal'
            attributes={{ mb: '$4', ml: '$12', alignItems: 'center' }}
          >
            {renderStatusIcon(statusInfo.status.txid)}
            <Text fontSize='$lg'>Claimed VDL TXID</Text>
            {statusInfo.status.txid && (
              <Text fontSize='$md' attributes={{ ml: '$4' }}>
                {statusInfo.status.txid}
              </Text>
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
