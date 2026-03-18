export type SportGroup = 'carrera' | 'lanzamiento'
export type ResultUnit = 'seconds' | 'meters'

export interface DisciplineConfig {
  id: string
  label: string
  group: SportGroup
  resultUnit: ResultUnit
  resultLabel: string
  betterIs: 'lower' | 'higher'
}

export interface SportGroupConfig {
  id: SportGroup
  label: string
  icon: string
  description: string
}

export const SPORT_GROUPS: SportGroupConfig[] = [
  {
    id: 'carrera',
    label: 'Carrera',
    icon: 'Timer',
    description: 'Velocidad, medio fondo, fondo',
  },
  {
    id: 'lanzamiento',
    label: 'Lanzamiento',
    icon: 'Target',
    description: 'Disco, bala, jabalina, martillo',
  },
]

export const DISCIPLINES: DisciplineConfig[] = [
  { id: '100m',   label: '100 metros',  group: 'carrera',     resultUnit: 'seconds', resultLabel: 'Tiempo',    betterIs: 'lower'  },
  { id: '200m',   label: '200 metros',  group: 'carrera',     resultUnit: 'seconds', resultLabel: 'Tiempo',    betterIs: 'lower'  },
  { id: '400m',   label: '400 metros',  group: 'carrera',     resultUnit: 'seconds', resultLabel: 'Tiempo',    betterIs: 'lower'  },
  { id: '800m',   label: '800 metros',  group: 'carrera',     resultUnit: 'seconds', resultLabel: 'Tiempo',    betterIs: 'lower'  },
  { id: '1500m',  label: '1500 metros', group: 'carrera',     resultUnit: 'seconds', resultLabel: 'Tiempo',    betterIs: 'lower'  },
  { id: '5000m',  label: '5000 metros', group: 'carrera',     resultUnit: 'seconds', resultLabel: 'Tiempo',    betterIs: 'lower'  },
  { id: '10000m', label: '10000 metros',group: 'carrera',     resultUnit: 'seconds', resultLabel: 'Tiempo',    betterIs: 'lower'  },
  { id: 'disco',  label: 'Disco',       group: 'lanzamiento', resultUnit: 'meters',  resultLabel: 'Distancia', betterIs: 'higher' },
  { id: 'bala',   label: 'Bala',        group: 'lanzamiento', resultUnit: 'meters',  resultLabel: 'Distancia', betterIs: 'higher' },
  { id: 'jabalina', label: 'Jabalina',  group: 'lanzamiento', resultUnit: 'meters',  resultLabel: 'Distancia', betterIs: 'higher' },
  { id: 'martillo', label: 'Martillo',  group: 'lanzamiento', resultUnit: 'meters',  resultLabel: 'Distancia', betterIs: 'higher' },
]

export function formatResult(val: number, unit: ResultUnit): string {
  if (unit === 'seconds') {
    if (val >= 60) {
      const min = Math.floor(val / 60)
      const sec = (val % 60).toFixed(1)
      return `${min}:${sec.padStart(4, '0')}`
    }
    return `${val}s`
  }
  return `${val.toFixed(2)}m`
}

export function getDisciplinesForGroup(group: SportGroup): DisciplineConfig[] {
  return DISCIPLINES.filter((d) => d.group === group)
}

export function getDisciplineConfig(id: string): DisciplineConfig | undefined {
  return DISCIPLINES.find((d) => d.id === id)
}
