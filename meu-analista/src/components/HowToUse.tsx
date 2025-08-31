import React from 'react';
import { MagnifyingGlassIcon, CheckBadgeIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
// conteudo dos cards
const steps =[
  {
    icon: MagnifyingGlassIcon,
    title: 'Insira o Ticlker',
    description: 'Digite o codigo da ação que deseja analisar na caixa do chat (ex: PETR4, MGLU3).',
  },
  {
    icon: CheckBadgeIcon,
    title: 'Valide os Dados',
    description: 'O painel de dados será preenchido com as informações da empresa. Verifique se estão corretas antes de enviar.',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Receba a Análise',
    description: 'Interaja com o assistente para receber uma análise fundamentalista completa e tire suas conclusões.',
  }
]

export default function HowToUse() {
  return (
    <section className="mb-20">
      <h2 className='text-3xl font-bold text-center mt-12 mb-12'>Como Funciona</h2>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-8'> {steps.map((step) => {
        const IconComponent = step.icon;
        return (
        <div key={step.title} className='bg-white/5 p-6 rounded-lg border border-white/10 text-center'>
          <div className='flex justify-center mb-4'>
            <IconComponent className='h-12 w-12 text-primary'/>
          </div>
          <h3 className='text-xl font-bold mt-4 mb-2'>{step.title}</h3>
          <p className='text-text-secondary'>{step.description}</p>
        </div>
      );
      })}
      </div>
    </section>
  );
}