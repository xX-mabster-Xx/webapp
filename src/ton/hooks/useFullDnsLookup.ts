import { useState, useEffect } from 'react';
import { useTonClient } from './useTonClient';
import { Address, Builder, Cell, Slice } from '@ton/core';
import { Buffer } from 'buffer';
import { DnsContract } from '../wrappers/DnsContract';

/**
 * Рекурсивная функция для «полного» разрешения, которая умеет
 * открывать новый контракт через клиент, а не просто создавать DnsContract.
 */
async function dnsResolveAllWithClient(
  client: ReturnType<typeof useTonClient>,
  currentAddress: Address,
  remainingDomain: Slice,
  category: number,
  iteration = 1
): Promise<Cell | null> {

    if (!client) {
      throw new Error('Client is not initialized');
    }

    if (iteration > 50) {
        console.error('Too many DNS recursion iterations');
        return null;
    }
  
    // 1. «Открываем» контракт по текущему адресу
    const rawContract = new DnsContract(currentAddress);
    const dnsContract = client.open(rawContract);

    // 2. Вызываем getDnsRecord
    const result = await dnsContract.getDnsRecord(remainingDomain, category);
    const partialBits = result.numberValue;
    const recordCell = result.cellValue;

    if (partialBits === 0) {
        // Ничего не найдено
        return null;
    }

    // Если это полный матч — возвращаем что есть
    if (partialBits === remainingDomain.remainingBits) {
        return recordCell;
    }

    // Иначе проверяем, не dns_next_resolver ли
    const slice = recordCell.beginParse();
    const magic = slice.loadUint(16);
    if (magic !== 0xba93) {
        // Не dns_next_resolver -> частичное разрешение, но нечем продолжить
        return recordCell;
    }

    // Считываем адрес резолвера
    const nextResolver = slice.loadAddress();
    if (!nextResolver) {
        return recordCell;
    }

    // Откусываем часть домена
    const newRemaining = remainingDomain.skip(partialBits);

    // Рекурсивно переходим к следующему резолверу
    return dnsResolveAllWithClient(client, nextResolver, newRemaining, category, iteration + 1);
    }

    export function useFullDnsLookup(domain: string | null) {
    const client = useTonClient();

    const [state, setState] = useState<{
        loading: boolean;
        resultCell: Cell | null;
        error: string | null;
    }>({
        loading: false,
        resultCell: null,
        error: null,
    });

    useEffect(() => {
        if (!client || !domain) {
        setState({ loading: false, resultCell: null, error: null });
        return;
        }

        // Запуск разрешения
        (async () => {
        try {
            setState(s => ({ ...s, loading: true, error: null }));
            
            // 1. Готовим Cell (допустим, domain уже "\0ton\0mysite\0")
            const domainCell = new Builder()
            .storeBuffer(Buffer.from(domain, 'utf-8'))
            .endCell();

            // 2. Корневой DNS
            const rootDnsAddress = Address.parse('Ef_lZ1T4NCb2mwkme9h2rJfESCE0W34ma9lWp7-_uY3zXDvq');

            // 3. Вызываем «расширенное» разрешение
            const finalCell = await dnsResolveAllWithClient(
            client,
            rootDnsAddress,
            domainCell.asSlice(),
            0 // category=0 -> все категории
            );

            setState({
            loading: false,
            resultCell: finalCell,
            error: null,
            });
        } catch (err: any) {
            setState({
            loading: false,
            resultCell: null,
            error: err.message || 'Unknown error',
            });
        }
        })();
    }, [client, domain]);

    return state;
}
