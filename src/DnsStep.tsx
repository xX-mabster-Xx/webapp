import React, { useEffect, useState } from 'react';
import { useTonClient } from './ton/hooks/useTonClient';
import { Address, Builder, Cell } from '@ton/core';
import { Buffer } from 'buffer';
import { DnsContract } from './ton/wrappers/DnsContract';

type StepProps = {
  stepId: number;
  resolver: string;         // Адрес текущего DNS-резолвера
  remainingDomain: string;  // Оставшийся домен (base64)
  onNextResolver: (nextResolver: string, newDomain: string) => void;
};

export function DnsStep(props: StepProps) {
  const client = useTonClient();

  // Для удобства зафиксируем resolver/remainingDomain в локальном состоянии
  // но не будем использовать их как зависимости в useEffect,
  // чтобы не повторять запрос при каждом обновлении пропсов.
  const [resolver] = useState(props.resolver);
  const [base64Domain] = useState(props.remainingDomain);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultCell, setResultCell] = useState<Cell | null>(null);
  const [partialBits, setPartialBits] = useState<number | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Счётчик повторов (сетевые ошибки)
  const [retryCount, setRetryCount] = useState(0);

  // Основная логика запроса
  const fetchDnsRecord = async () => {
    if (!client) return;
    setLoading(true);
    setError(null);

    try {
      const address = Address.parse(resolver);
      const contract = new DnsContract(address);
      const dnsContract = client.open(contract);

      const domainCell = new Builder()
        .storeBuffer(Buffer.from(base64Domain, 'base64'))
        .endCell();

      setLogs(l => [
        ...l,
        `Step #${props.stepId}: resolver=${address.toString()}`,
        `Domain bits: ${domainCell.bits.length}`,
      ]);

      // Вызываем getDnsRecord
      const result = await dnsContract.getDnsRecord(domainCell.asSlice(), 0);

      setPartialBits(result.numberValue);
      setResultCell(result.cellValue);

      setLogs(l => [
        ...l,
        `Resolved bits (m): ${result.numberValue}`,
        `Cell: ${result.cellValue.toString()}`,
      ]);

      const bitsTotal = domainCell.bits.length;
      const bitsResolved = result.numberValue;

      // 1. Если ничего не найдено
      if (bitsResolved === 0) {
        setLogs(l => [...l, 'm=0 => Domain not resolved. Stopping.']);
        return;
      }

      // 2. Полностью разрешён
      if (bitsResolved === bitsTotal) {
        setLogs(l => [...l, 'm=n => Domain fully resolved here.']);
        return;
      }

      // 3. Частичное разрешение => проверяем dns_next_resolver
      setLogs(l => [...l, 'Partial resolution => checking dns_next_resolver']);

      const slice = result.cellValue.beginParse();
      const magic = slice.loadUint(16);
      if (magic === 0xba93) {
        const nextResolver = slice.loadAddress();
        if (nextResolver) {
          // Не допускаем зацикливания
          if (nextResolver.equals(address)) {
            setLogs(l => [
              ...l,
              'Warning: next_resolver == current => stopping loop',
            ]);
            return;
          }

          // Откусываем bitsResolved
          const newSlice = domainCell.asSlice().skip(bitsResolved);
          if (newSlice.remainingBits === 0) {
            setLogs(l => [...l, 'No bits left => stopping']);
            return;
          }

          const newRemainingDomain = newSlice
            .loadBuffer(newSlice.remainingBits / 8)
            .toString('base64');

          setLogs(l => [
            ...l,
            `Next resolver: ${nextResolver.toString()}`,
            `Unresolved domain part: ${newRemainingDomain}`,
          ]);
          // Создаём новый шаг
          props.onNextResolver(nextResolver.toString(), newRemainingDomain);
        } else {
          setLogs(l => [...l, 'dns_next_resolver is null => stopping']);
        }
      } else {
        setLogs(l => [
          ...l,
          `magic=0x${magic.toString(16)} != 0xba93 => no further step`,
        ]);
      }
    } catch (err: any) {
      if (err.message.includes('exit_code: -13')) {
        setError('Unable to execute get method. Got exit_code: -13');
        setLogs(l => [...l, `Error: ${err.message}`]);
      } else if (err.message.includes('status code') && retryCount < 3) {
        setRetryCount(prev => prev + 1);
        setLogs(l => [...l, `Retry network error (attempt ${retryCount + 1})`]);
        // Повторный запрос
        setTimeout(fetchDnsRecord, 1000);
      } else {
        setError(err.message || 'Unknown error');
        setLogs(l => [...l, `Error: ${err.message}`]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Эффект — вызываем fetchDnsRecord один раз при монтировании + при повторных сетевых попытках
  useEffect(() => {
    fetchDnsRecord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount, client]); 
  // Зависимости: client (чтобы не крашилось, если client из контекста),
  // и retryCount, чтобы повторять при сетевых ошибках.

  return (
    <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px dashed #aaa' }}>
      <h3>Step #{props.stepId}</h3>
      <p>DNS Resolver Address: {resolver}</p>
      <p>Remaining domain (base64): {base64Domain}</p>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!error && !loading && partialBits !== null && (
        <div>
          <p>Partial bits: {partialBits}</p>
          {resultCell && <pre>Cell: {resultCell.toString()}</pre>}
        </div>
      )}

      {logs.length > 0 && (
        <details style={{ marginTop: '0.5rem' }} open>
          <summary>Logs</summary>
          <ul>
            {logs.map((log, idx) => (
              <li key={idx}>{log}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
