import React, { useState, useEffect } from 'react';
import { DnsStep } from './DnsStep';

type DnsStepInfo = {
  id: number;
  resolver: string;
  remainingDomain: string;
  displayName: string;
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
        displayName: 'root DNS'
      },
    ]);
  }, [props.rootDomain]);

  // Функция, вызываемая, когда DnsStep находит next_resolver
  const addNextStep = (resolver: string, domain: string, displayName: string) => {
    setSteps(prev => [
      ...prev,
      {
        id: Date.now(), // уникальный id
        resolver,
        remainingDomain: domain,
        displayName,
      },
    ]);
  };

  const handleReset = () => {
    props.onReset();
  };

  return (
    <div className='resolve-chain'>

      {steps.map(step => (
        <DnsStep
          key={step.id}
          stepId={step.id}
          resolver={step.resolver}
          remainingDomain={step.remainingDomain}
          displayName={step.displayName}
          onNextResolver={(nextResolver: string, newDomain: string, displayName: string) =>
            addNextStep(nextResolver, newDomain, displayName)
          }
        />
      ))}
    </div>
  );
}
