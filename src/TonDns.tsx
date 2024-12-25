import React from 'react';
import { TonConnectUIProvider, TonConnectButton } from '@tonconnect/ui-react';

const manifestUrl = '/tonconnect-manifest.json';

const TonDns = () => {
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
        <h3>Hello</h3>
        <TonConnectButton />
    </TonConnectUIProvider>
  );
};

export default TonDns;
