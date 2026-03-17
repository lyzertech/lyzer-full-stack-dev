'use client'

import React, { useEffect, useState } from 'react'
import SpkTables from '@/shared/@spk-reusable-components/reusable-tables/spk-tables'
import SpkBadge from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge'
import Image from 'next/image'

type Teacher = {
  id: string
  name: string
  department: string
  status: 'Active' | 'On Leave' | 'Inactive'
  avatar?: string
  email?: string
  phone?: string
}

const AcuvimIIV3EnergyList: React.FC = () => {
  const [data, setData] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const registersEnergy = [
    {
      h: '4048H-4049H',
      d: '16456-16457',
      symbol: 'Ep_Imp',
      param: 'Consumed Energy',
      range: '0~999999999',
      prop: 'kWh',
      type: 'Dword',
      access: 'R/W',
      prop2: '',
    },
    {
      h: '404AH-404BH',
      d: '16458-16459',
      symbol: 'Ep_Exp',
      param: 'Generated Energy',
      range: '0~999999999',
      prop: 'kWh',
      type: 'Dword',
      access: 'R/W',
      prop2: '',
    },
    {
      h: '404CH-404DH',
      d: '16460-16461',
      symbol: 'Eq_Imp',
      param: 'Consumed Reactive Energy',
      range: '0~999999999',
      prop: 'kvarh',
      type: 'Dword',
      access: 'R/W',
      prop2: '',
    },
    {
      h: '404EH-404FH',
      d: '16462-16463',
      symbol: 'Eq_Exp',
      param: 'Generated Reactive Energy',
      range: '0~999999999',
      prop: 'kvarh',
      type: 'Dword',
      access: 'R/W',
      prop2: '',
    },
    {
      h: '4050H-4051H',
      d: '16464-16465',
      symbol: 'Ep_sum',
      param: 'Total Energy',
      range: '0~999999999',
      prop: 'kWh',
      type: 'Dword',
      access: 'R/W',
      prop2: '',
    },
    {
      h: '4052H-4053H',
      d: '16466-16467',
      symbol: 'Ep_net',
      param: 'Net Energy',
      range: '±999999999',
      prop: 'kWh',
      type: 'Dword',
      access: 'R/W',
      prop2: '',
    },
    {
      h: '4054H-4055H',
      d: '16468-16469',
      symbol: 'Eq_sum',
      param: 'Total Reactive Energy',
      range: '0~999999999',
      prop: 'kvarh',
      type: 'Dword',
      access: 'R/W',
      prop2: '',
    },
    {
      h: '4056H-4057H',
      d: '16470-16471',
      symbol: 'Eq_net',
      param: 'Net Reactive Energy',
      range: '±999999999',
      prop: 'kvarh',
      type: 'Dword',
      access: 'R/W',
      prop2: '',
    },
    {
      h: '4058H-4059H',
      d: '16472-16473',
      symbol: 'Es',
      param: 'Apparent Energy',
      range: '0~999999999',
      prop: 'kVAh',
      type: 'Dword',
      access: 'R/W',
      prop2: '',
    },
    {
      h: '4620H-4621H',
      d: '17952-17953',
      symbol: 'Epa_Imp',
      param: 'Phase A Consumed Energy',
      range: '0~999999999',
      prop: 'kWh',
      type: 'Dword',
      access: 'R/W',
      prop2: '',
    },
    {
      h: '4622H-4623H',
      d: '17954-17955',
      symbol: 'Epa_Exp',
      param: 'Phase A Generated Energy',
      range: '0~999999999',
      prop: 'kWh',
      type: 'Dword',
      access: 'R/W',
      prop2: '',
    },
    {
      h: '4624H-4625H',
      d: '17956-17957',
      symbol: 'Epb_Imp',
      param: 'Phase B Consumed Energy',
      range: '0~999999999',
      prop: 'kWh',
      type: 'Dword',
      access: 'R/W',
      prop2: '',
    },
    {
      h: '4626H-4627H',
      d: '17958-17959',
      symbol: 'Epb_Exp',
      param: 'Phase B Generated Energy',
      range: '0~999999999',
      prop: 'kWh',
      type: 'Dword',
      access: 'R/W',
      prop2: '',
    },
    {
      h: '4628H-4629H',
      d: '17960-17961',
      symbol: 'Epc_Imp',
      param: 'Phase C Consumed Energy',
      range: '0~999999999',
      prop: 'kWh',
      type: 'Dword',
      access: 'R/W',
      prop2: '',
    },
    {
      h: '462AH-462BH',
      d: '17962-17963',
      symbol: 'Epc_Exp',
      param: 'Phase C Generated Energy',
      range: '0~999999999',
      prop: 'kWh',
      type: 'Dword',
      access: 'R/W',
      prop2: '',
    },
    {
      h: '462CH-462DH',
      d: '17964-17965',
      symbol: 'Eqa_Imp',
      param: 'Phase A Consumed Reactive Energy',
      range: '0~999999999',
      prop: 'kvarh',
      type: 'Dword',
      access: 'R/W',
      prop2: '',
    },
    {
      h: '462EH-462FH',
      d: '17966-17967',
      symbol: 'Eqa_Exp',
      param: 'Phase A Generated Reactive Energy',
      range: '0~999999999',
      prop: 'kvarh',
      type: 'Dword',
      access: 'R/W',
      prop2: '',
    },
    {
      h: '4630H-4631H',
      d: '17968-17969',
      symbol: 'Eqb_Imp',
      param: 'Phase B Consumed Reactive Energy',
      range: '0~999999999',
      prop: 'kvarh',
      type: 'Dword',
      access: 'R/W',
      prop2: '',
    },
    {
      h: '4632H-4633H',
      d: '17970-17971',
      symbol: 'Eqb_Exp',
      param: 'Phase B Generated Reactive Energy',
      range: '0~999999999',
      prop: 'kvarh',
      type: 'Dword',
      access: 'R/W',
      prop2: '',
    },
    {
      h: '4634H-4635H',
      d: '17972-17973',
      symbol: 'Eqc_Imp',
      param: 'Phase C Consumed Reactive Energy',
      range: '0~999999999',
      prop: 'kvarh',
      type: 'Dword',
      access: 'R/W',
      prop2: '',
    },
    {
      h: '4636H-4637H',
      d: '17974-17975',
      symbol: 'Eqc_Exp',
      param: 'Phase C Generated Reactive Energy',
      range: '0~999999999',
      prop: 'kvarh',
      type: 'Dword',
      access: 'R/W',
      prop2: '',
    },
    {
      h: '4638H-4639H',
      d: '17976-17977',
      symbol: 'Esa',
      param: 'Phase A Apparent Energy',
      range: '0~999999999',
      prop: 'kVA',
      type: 'Dword',
      access: 'R/W',
      prop2: '',
    },
    {
      h: '463AH-463BH',
      d: '17978-17979',
      symbol: 'Esb',
      param: 'Phase B Apparent Energy',
      range: '0~999999999',
      prop: 'kVA',
      type: 'Dword',
      access: 'R/W',
      prop2: '',
    },
    {
      h: '463CH-463DH',
      d: '17980-17981',
      symbol: 'Esc',
      param: 'Phase C Apparent Energy',
      range: '0~999999999',
      prop: 'kVA',
      type: 'Dword',
      access: 'R/W',
      prop2: '',
    },
  ]

  return (
    <div className="table-responsive">
      <SpkTables
        tableClass="text-nowrap"
        header={[
          { title: 'Address(H)' },
          { title: 'Address(D)' },
          { title: 'Symbol' },
          { title: 'Parameter' },
          { title: 'Property' },
          { title: 'Data Type' },
          { title: 'Access Property' },
        ]}
      >
        {registersEnergy.map((r, idx) => (
          <tr key={idx}>
            <td>{r.h}</td>
            <td>{r.d}</td>
            <td>{r.symbol}</td>
            <td>{r.param}</td>
            <td>{r.prop || '-'}</td>
            <td>{r.type}</td>
            <td>{r.access}</td>
          </tr>
        ))}
      </SpkTables>
    </div>
  )
}

export default AcuvimIIV3EnergyList







