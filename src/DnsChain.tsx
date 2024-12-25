import React, { useState, useEffect } from 'react';
import { DnsStep } from './DnsStep';

type DnsStepInfo = {
  id: number;
  resolver: string;
  remainingDomain: string;
};

export function DnsChain(props: {
  rootDomain: string;
  onReset: () => void;
}) {
  const [steps, setSteps] = useState<DnsStepInfo[]>([]);

  // При изменении rootDomain сбрасываем цепочку
  useEffect(() => {
    // Создаём начальный шаг (root DNS)
    setSteps([
      {
        id: Date.now(),
        resolver: 'Ef_lZ1T4NCb2mwkme9h2rJfESCE0W34ma9lWp7-_uY3zXDvq',
        remainingDomain: props.rootDomain,
      },
    ]);
  }, [props.rootDomain]);

  // Функция, вызываемая, когда DnsStep находит next_resolver
  const addNextStep = (resolver: string, domain: string) => {
    setSteps(prev => [
      ...prev,
      {
        id: Date.now(), // уникальный id
        resolver,
        remainingDomain: domain,
      },
    ]);
  };

  const handleReset = () => {
    props.onReset();
  };

  return (
    <div style={{ border: '1px solid gray', margin: '1rem', padding: '1rem' }}>
      <h2>DNS Chain</h2>
      <button onClick={handleReset}>Сбросить</button>

      {steps.map(step => (
        <DnsStep
          key={step.id}
          stepId={step.id}
          resolver={step.resolver}
          remainingDomain={step.remainingDomain}
          onNextResolver={(nextResolver: string, newDomain: string) =>
            addNextStep(nextResolver, newDomain)
          }
        />
      ))}
    </div>
  );
}
