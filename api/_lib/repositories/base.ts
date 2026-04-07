/**
 * Interfaz base Repository<T>.
 * Todos los repositorios del dominio la implementan.
 */

export interface Filters {
  limit?: number
  offset?: number
  from?: string   // fecha ISO inicio
  to?: string     // fecha ISO fin
}

export interface Repository<T, CreateDto, UpdateDto> {
  findById(id: string): Promise<T | null>
  findByAthleteId(athleteId: string, filters?: Filters): Promise<T[]>
  create(data: CreateDto): Promise<T>
  update(id: string, data: UpdateDto): Promise<T>
  delete(id: string): Promise<void>
}
