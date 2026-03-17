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

const AcuvimIIV3BasicList: React.FC = () => {
  const [data, setData] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const registers = [
    {
      h: '4000H-4001H',
      d: '16384-16385',
      symbol: 'F',
      param: 'Frequency',
      prop: 'Hz',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '4002H-4003H',
      d: '16386-16387',
      symbol: 'U1',
      param: 'Phase 1 Voltage',
      prop: 'V',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '4004H-4005H',
      d: '16388-16389',
      symbol: 'U2',
      param: 'Phase 2 Voltage',
      prop: 'V',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '4006H-4007H',
      d: '16390-16391',
      symbol: 'U3',
      param: 'Phase 3 Voltage',
      prop: 'V',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '4008H-4009H',
      d: '16392-16393',
      symbol: 'Uavg',
      param: 'Average Phase Voltage',
      prop: 'V',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '400AH-400BH',
      d: '16394-16395',
      symbol: 'U12',
      param: 'Line Voltage 1-2',
      prop: 'V',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '400CH-400DH',
      d: '16396-16397',
      symbol: 'U23',
      param: 'Line Voltage 2-3',
      prop: 'V',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '400EH-400FH',
      d: '16398-16399',
      symbol: 'U31',
      param: 'Line Voltage 3-1',
      prop: 'V',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '4010H-4011H',
      d: '16400-16401',
      symbol: 'Ulavg',
      param: 'Average Line Voltage',
      prop: 'V',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '4012H-4013H',
      d: '16402-16403',
      symbol: 'IL1',
      param: 'Total Phase A Current',
      prop: 'A',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '4014H-4015H',
      d: '16404-16405',
      symbol: 'IL2',
      param: 'Total Phase B Current',
      prop: 'A',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '4016H-4017H',
      d: '16406-16407',
      symbol: 'IL3',
      param: 'Total Phase C Current',
      prop: 'A',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '4018H-4019H',
      d: '16408-16409',
      symbol: 'Iavg',
      param: 'Average Phase Current',
      prop: 'A',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '401AH-401BH',
      d: '16410-16411',
      symbol: 'In',
      param: 'Neutral Current',
      prop: 'A',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '401CH-401DH',
      d: '16412-16413',
      symbol: 'Pa',
      param: 'Phase A Power',
      prop: 'kW',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '401EH-401FH',
      d: '16414-16415',
      symbol: 'Pb',
      param: 'Phase B Power',
      prop: 'kW',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '4020H-4021H',
      d: '16416-16417',
      symbol: 'Pc',
      param: 'Phase C Power',
      prop: 'kW',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '4022H-4023H',
      d: '16418-16419',
      symbol: 'Psum',
      param: 'Total System Power',
      prop: 'kW',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '4024H-4025H',
      d: '16420-16421',
      symbol: 'Qa',
      param: 'Phase A Reactive Power',
      prop: 'kvar',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '4026H-4027H',
      d: '16422-16423',
      symbol: 'Qb',
      param: 'Phase B Reactive Power',
      prop: 'kvar',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '4028H-4029H',
      d: '16424-16425',
      symbol: 'Qc',
      param: 'Phase C Reactive Power',
      prop: 'kvar',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '402AH-402BH',
      d: '16426-16427',
      symbol: 'Qsum',
      param: 'Total Reactive Power',
      prop: 'kvar',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '402CH-402DH',
      d: '16428-16429',
      symbol: 'Sa',
      param: 'Phase A Apparent Power',
      prop: 'kVA',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '402EH-402FH',
      d: '16430-16431',
      symbol: 'Sb',
      param: 'Phase B Apparent Power',
      prop: 'kVA',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '4030H-4031H',
      d: '16432-16433',
      symbol: 'Sc',
      param: 'Phase C Apparent Power',
      prop: 'kVA',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '4032H-4033H',
      d: '16434-16435',
      symbol: 'Ssum',
      param: 'Total Apparent Power',
      prop: 'kVA',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '4034H-4035H',
      d: '16436-16437',
      symbol: 'PFa',
      param: 'Phase A Power Factor',
      prop: 'No Unit',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '4036H-4037H',
      d: '16438-16439',
      symbol: 'PFb',
      param: 'Phase B Power Factor',
      prop: 'No Unit',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '4038H-4039H',
      d: '16440-16441',
      symbol: 'PFc',
      param: 'Phase C Power Factor',
      prop: 'No Unit',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '403AH-403BH',
      d: '16442-16443',
      symbol: 'PFsum',
      param: 'Total Power Factor',
      prop: 'No Unit',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '403CH-403DH',
      d: '16444-16445',
      symbol: 'U_unbl',
      param: 'Voltage Unbalance',
      prop: '%',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '403EH-403FH',
      d: '16446-16447',
      symbol: 'I_unbl',
      param: 'Current Unbalance',
      prop: '%',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '4040H-4041H',
      d: '16448-16449',
      symbol: 'L/C/R',
      param: 'Load Characteristic',
      prop: '',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '4042H-4043H',
      d: '16450-16451',
      symbol: 'P_Dmd',
      param: 'Power Demand',
      prop: 'kW',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '4044H-4045H',
      d: '16452-16453',
      symbol: 'Q_Dmd',
      param: 'Reactive Power Demand',
      prop: 'kVA',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '4046H-4047H',
      d: '16454-16455',
      symbol: 'S_Dmd',
      param: 'Apparent Power Demand',
      prop: 'kvar',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '4600H-4601H',
      d: '17920-17921',
      symbol: 'I1_Dmd',
      param: 'Phase A Current Demand',
      prop: 'A',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '4602H-4603H',
      d: '17922-17923',
      symbol: 'I2_Dmd',
      param: 'Phase B Current Demand',
      prop: 'A',
      type: 'Float',
      access: 'R',
      prop2: '',
    },
    {
      h: '4604H-4605H',
      d: '17924-17925',
      symbol: 'I3_Dmd',
      param: 'Phase C Current Demand',
      prop: 'A',
      type: 'Float',
      access: 'R',
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
        {registers.map((r, idx) => (
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

export default AcuvimIIV3BasicList







