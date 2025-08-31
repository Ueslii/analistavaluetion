import React from 'react';
import { ScaleIcon, ShieldCheckIcon, BeakerIcon } from '@heroicons/react/24/outline';

const widgets = [
  {
    icon: ScaleIcon,
    title: 'O que é Preço Justo?',
    description: 'Calculamos o valor intrínseco de uma empresa com base em seu fluxo de caixa futuro, descontado a uma taxa que reflete seus riscos.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Margem de Segurança',
    description: 'O princípio de investir com uma "margem de segurança" significa comprar uma ação por um preço significativamente abaixo do seu valor justo estimado.',
  },
  {
    icon: BeakerIcon,
    title: 'Análise Qualitativa',
    description: 'Lembre-se: números são importantes, mas a qualidade da gestão e as vantagens competitivas da empresa são cruciais para o sucesso a longo prazo.',
  }
];
 
export default function KeyWidgets() {
  return (
    <section className='mb-20'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
        {widgets.map((widget) => {
          const IconComponent = widget.icon;
          return (
            <div key={widget.title} className='bg-white/5 p-6 rounded-lg border border-white/10'>
              <div className='flex items-center gap-4 mb-4'>
                <IconComponent className='h-8 w-8 text-primary'/>
                <h3 className='text-xl font-bold'>{widget.title}</h3>
              </div>
                <p className='text-text-secondary'>{widget.description}</p>
            </div>
          );
        })}
              </div>
      
    </section>   
  );
}