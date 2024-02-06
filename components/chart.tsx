import React from 'react'
import { LineChart } from '@mui/x-charts'
import { faker}  from "@faker-js/faker"

export default function Chart() {

    const price = [40400, 45000, 43000, 42000, 41000]

    return (

    <LineChart
    height={300}
    xAxis={[{ data: [0.1, 0.2, 0.3, 0.5, 0.8, 1] }]}
    series={[
      {
        data: price,
        color: '#6078F9',
        
      },
    ]}
  />
    );

}