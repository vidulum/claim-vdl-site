/**
 * IMPORTANT NOTE:
 * No private keys, mnemonics, or any other secure private key information 
 * are ever sent to this backend. This file strictly handles non-sensitive 
 * data and ensures the security of user credentials.
 */

import { error } from 'console';

const API_URL = 'https://claim.vidulum.app/api';

interface StatusResponse {
  status: {
    txid?: string;
    submit?: string;
    complete?: string;
  };
  bzeAddress: string;
  amount: string;
}

export const apiGetAmount = async (vdlAddress: string) => {
  try {
    const response = await fetch(`${API_URL}/amount/${vdlAddress}`, {
      method: 'GET',
    });

    const data = await response.json();
    return { error: null, amount: data.amount };
    // {
    //   amount: float,
    // }
  } catch (error) {
    console.error('Error fetching amount:', error);
    return { error: 'Failed to fetch amount. Try again later.', amount: null };
  }
};

export const apiGetStatus = async (vdlAddress: string) => {
  try {
    const response = await fetch(`${API_URL}/status/${vdlAddress}`, {
      method: 'GET',
    });

    const data = await response.json();

    const status: StatusResponse = {
      status: {
        txid: data.txid,
        submit: data.submit,
        complete: data.completed,
      },
      bzeAddress: data.bzeAddress,
      amount: data.amount,
    };

    return status;
  } catch (error) {
    console.error('Error fetching status:', error);
    return false;
  }
};

export const apiVerifyMessage = async (
  bzeAddress: string,
  vdlPubKey: string,
  signature: string,
  vdlAddress: string
) => {
  try {
    const response = await fetch(`${API_URL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bzeAddress,
        vdlPubKey,
        signature,
        vdlAddress,
      }),
    });

    const data = await response.json();
    // {
    //   error: string || null
    // }
    if (data.error) {
      return data.error;
    }
    return null;
  } catch (error) {
    const errLabel = 'Error while trying to verifying your claim.';
    console.error(errLabel, error);
    return errLabel;
  }
};
