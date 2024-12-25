import React, { useState } from 'react';
import { TonConnectUIProvider, TonConnectButton } from '@tonconnect/ui-react';
import { DnsChain } from './DnsChain';
import './styles/TonDns.css';

/**
 * Преобразуем "x-mabster-x.ton" => "\0ton\0x-mabster-x\0"
 */

function transformDomain(input: string): string {
  if (!input) return '';
  const parts = input.split('.').reverse();
  const rawDomain = `\0${parts.join('\0')}\0`; // Преобразуем домен в \0-разделённый формат
  return Buffer.from(rawDomain, 'utf-8').toString('base64'); // Кодируем в Base64
}


const manifestUrl =
  'https://raw.githubusercontent.com/xX-mabster-Xx/xX-mabster-Xx.github.io/refs/heads/master/public/tonconnect-manifest.json';

export default function TonDnsFull() {
  const [userDomain, setUserDomain] = useState('');
  const [queryDomain, setQueryDomain] = useState('');
  const [start, setStart] = useState(false);

  // Обрабатываем Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Преобразуем домен в нужный формат
      const transformed = transformDomain(userDomain);

      setQueryDomain(transformed);
      setStart(false); // Скрываем текущий DnsChain перед запуском нового
      setTimeout(() => setStart(true), 0); // Небольшая задержка для "перезапуска"

    }
  };

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <TonConnectButton className="ton-button" />

      <div className="main-dns">
        <input
          className="dns-input"
          type="text"
          placeholder="Введите (например: x-mabster-x.ton), нажмите Enter"
          value={userDomain}
          onChange={(e) => setUserDomain(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {start && (
          <DnsChain
            rootDomain={queryDomain}
            onReset={() => {
              setStart(false); // Скрываем DnsChain при сбросе
              setQueryDomain('');
            }}
          />
        )}
      </div>
    </TonConnectUIProvider>
  );
}
