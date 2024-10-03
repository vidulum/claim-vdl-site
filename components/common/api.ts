import { error } from 'console';

const API_URL = 'http://localhost:3001';

interface StatusResponse {
  status: {
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
    //   error: null,
    // }
    if (!data.error) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error verifying message:', error);
    return false;
  }
};
