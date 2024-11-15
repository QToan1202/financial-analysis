import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Line, ChartProps } from 'react-chartjs-2'
import dayjs from 'dayjs'
import localeData from 'dayjs/plugin/localeData'

dayjs.extend(localeData)

import { ScriptableContext, Chart as ChartJS } from 'chart.js'
import 'chart.js/auto'

import { useGetHistoricalPrice } from '@hooks'

import './adapterOverride'

type StockPriceProps = {
  isIncrease?: boolean
}

const options: ChartProps<'line'>['options'] = {
  responsive: true,
  scales: {
    x: {
      type: 'time',
      time: {
        unit: 'hour',
      },
      // bounds: 'ticks',
    },
  },
  elements: {
    point: {
      pointStyle: false,
    },
  },
  plugins: {
    legend: {
      display: false,
    },
  },
}

type TransformStockPricesType = { x: string; y: number }[]

const StockPrice = ({ isIncrease = true }: StockPriceProps) => {
  const { ticket } = useParams()
  const { data, isSuccess } = useGetHistoricalPrice(ticket || '')
  const chartRef = useRef<ChartJS<'line', TransformStockPricesType>>(null)
  const initRender = useRef<boolean>(true)
  const gradientBackgroundColor = useCallback(
    (ctx: ScriptableContext<'line'>) => {
      if (!chartRef.current) return 'rgba(21, 128, 61, 0.05)'

      const area = chartRef.current.chartArea || ctx.chart.chartArea
      const chartCtx = ctx.chart.ctx
      const gradient = chartCtx.createLinearGradient(0, area.bottom || 0, 0, area.top || 200)

      gradient.addColorStop(0, isIncrease ? 'rgba(21, 128, 61, 0.05)' : 'rgba(220, 38, 38, 0.05)')
      gradient.addColorStop(1, isIncrease ? 'rgba(21, 128, 61, 0.7)' : 'rgba(220, 38, 38, 0.5)')

      return gradient
    },
    [isIncrease]
  )
  const chartData = useMemo<ChartProps<'line', TransformStockPricesType>['data']>(
    () => ({
      datasets: [
        {
          data: isSuccess ? data.map(({ date, close }) => ({ x: date, y: close })) : [],
          borderWidth: 2,
          borderColor: isIncrease ? '#15803d' : '#dc2626',
          backgroundColor: gradientBackgroundColor,
          fill: 'start',
        },
      ],
    }),
    [data, gradientBackgroundColor, isIncrease, isSuccess]
  )

  useEffect(() => {
    if (!chartRef.current) return

    if (isSuccess && initRender) chartRef.current.update()

    return () => {
      initRender.current = false
    }
  }, [isSuccess])

  return isSuccess && <Line ref={chartRef} options={options} data={chartData} />
}

export default StockPrice
