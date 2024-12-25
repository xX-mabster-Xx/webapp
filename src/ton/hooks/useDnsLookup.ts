// hooks/useDnsLookup.ts
import { useState, useEffect } from 'react';
import { useTonClient } from './useTonClient';
import { Address, Builder } from '@ton/core';
import { DnsContract } from '../wrappers/DnsContract';


export function useDnsLookup(domain: string | null) {
  const client = useTonClient();

  const [state, setState] = useState<{
    numberValue: number | null;
    cellValue: string | null;
    error: string | null;
  }>({
    numberValue: null,
    cellValue: null,
    error: null,
  });

  useEffect(() => {
    // Если client ещё не инициализирован или домен пуст — ничего не делаем.

    async function fetchData() {
      if (!client || !domain) return;
      try {
        // Создаём DnsContract с нужным адресом (пример — Testnet DNS resolver)
        const contract = new DnsContract(
          Address.parse('Ef_lZ1T4NCb2mwkme9h2rJfESCE0W34ma9lWp7-_uY3zXDvq')
        );

        // Открываем контракт через клиент
        const dnsContract = client.open(contract);

        // Строим Cell с доменом
        const domainCell = new Builder()
          .storeBuffer(Buffer.from(domain, 'utf-8')) // domain уже с \0 в начале/конце
          .endCell();

        // Вызываем getDnsRecord
        const result = await dnsContract.getDnsRecord(
          domainCell.asSlice(),
          0
        );

        setState({
          numberValue: result.numberValue,
          cellValue: result.cellValue.toString(),
          error: null,
        });
      } catch (err) {
        setState({
          numberValue: null,
          cellValue: null,
          error: (err as Error).message,
        });
      }
    }

    fetchData();
  }, [client, domain]);

  return state;
}
