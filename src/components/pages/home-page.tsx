'use client';
import React from 'react';
import { Card, Button } from '@/components/ui';

interface HomePageProps {
  data: { voltage: string; current: string; power: string; energy: string; efficiency: string; pf: string; apparentPower: string; reactivePower: string; };
  metricStatus: { voltage: 'ok' | 'warning'; powerFactor: 'ok' | 'warning'; power: 'ok' | 'warning'; apparentPower: 'ok' | 'warning'; reactivePower: 'ok' | 'warning'; };
  onCardClick: (metric: { title: string; value: string; unit: string }) => void;
  onResetEnergy: () => void;
  resetStatus: string;
}

const StatusLight = ({ status }: { status: 'ok' | 'warning' }) => (
  <div className={`w-3 h-3 rounded-full absolute top-4 right-4 ${status === 'ok' ? 'bg-green-500' : 'bg-red-500'}`} />
);

export const HomePage = ({ data, metricStatus, onCardClick, onResetEnergy, resetStatus }: HomePageProps) => (
  <>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div onClick={() => onCardClick({ title: 'Voltage', value: data.voltage, unit: 'V' })} className="cursor-pointer relative">
        <Card className="h-56 w-full">
          <StatusLight status={metricStatus.voltage} />
          <h2 className="text-lg font-medium text-slate-400">Voltage</h2>
          <p className="text-3xl mt-12 font-bold text-blue-300">
            {data.voltage} <span className="text-base font-normal text-slate-500">V</span>
          </p>
        </Card>
      </div>
      <div onClick={() => onCardClick({ title: 'Current', value: data.current, unit: 'A' })} className="cursor-pointer relative">
        <Card className="h-56 w-full">
          <StatusLight status={'ok'} />
          <h2 className="text-lg font-medium text-slate-400">Current</h2>
          <p className="text-3xl mt-12 font-bold text-blue-300">
            {data.current} <span className="text-base font-normal text-slate-500">A</span>
          </p>
        </Card>
      </div>
      <div onClick={() => onCardClick({ title: 'Real Power', value: data.power, unit: 'W' })} className="cursor-pointer relative">
        <Card className="h-56 w-full">
          <StatusLight status={metricStatus.power} />
          <h2 className="text-lg font-medium text-slate-400">Real Power</h2>
          <p className="text-3xl mt-6 font-bold text-blue-300">
            {data.power} <span className="text-base font-normal text-slate-500">W</span>
          </p>
        </Card>
      </div>
      <div onClick={() => onCardClick({ title: 'Apparent Power', value: data.apparentPower, unit: 'VA' })} className="cursor-pointer relative">
        <Card className="h-56 w-full">
          <StatusLight status={metricStatus.apparentPower} />
          <h2 className="text-lg font-medium text-slate-400">Apparent Power</h2>
          <p className="text-3xl mt-6 font-bold text-blue-300">
            {data.apparentPower} <span className="text-base font-normal text-slate-500">VA</span>
          </p>
        </Card>
      </div>
      <div onClick={() => onCardClick({ title: 'Reactive Power', value: data.reactivePower, unit: 'VAR' })} className="cursor-pointer relative">
        <Card className="h-56 w-full">
          <StatusLight status={metricStatus.reactivePower} />
          <h2 className="text-lg font-medium text-slate-400">Reactive Power</h2>
          <p className="text-3xl mt-6 font-bold text-blue-300">
            {data.reactivePower} <span className="text-base font-normal text-slate-500">VAR</span>
          </p>
        </Card>
      </div>
      <div onClick={() => onCardClick({ title: 'Power Factor', value: data.pf, unit: '' })} className="cursor-pointer relative">
        <Card className="h-56 w-full">
          <StatusLight status={metricStatus.powerFactor} />
          <h2 className="text-lg font-medium text-slate-400">Power Factor</h2>
          <p className="text-3xl mt-6 font-bold text-blue-300">
            {data.pf}
          </p>
        </Card>
      </div>
      <div onClick={() => onCardClick({ title: 'Total Energy', value: data.energy, unit: 'Wh' })} className="cursor-pointer relative">
        <Card className="h-56 w-full">
          <StatusLight status={'ok'} />
          <h2 className="text-lg font-medium text-slate-400">Total Energy</h2>
          <p className="text-3xl mt-6 font-bold text-blue-300">
            {data.energy} <span className="text-base font-normal text-slate-500">Wh</span>
          </p>
        </Card>
      </div>
      <div onClick={() => onCardClick({ title: 'Efficiency', value: data.efficiency, unit: '%' })} className="cursor-pointer relative">
        <Card className="h-56 w-full">
          <StatusLight status={'ok'} />
          <h2 className="text-lg font-medium text-slate-400">MicroGrid Efficiency</h2>
          <p className="text-3xl mt-6 font-bold text-blue-300">
            {data.efficiency} <span className="text-base font-normal text-slate-500">%</span>
          </p>
        </Card>
      </div>
    </div>
    <div className="text-center mt-14">
      <Button onClick={onResetEnergy} variant="destructive">
        Reset Energy Counter
      </Button>
      {resetStatus && (
        <p className="mt-4 text-sm text-slate-400">{resetStatus}</p>
      )}
    </div>
  </>
);