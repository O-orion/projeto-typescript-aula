import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm'
import { Sensor } from './Sensor'

// teste
@Entity('area')
export default class Area {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 100, nullable: false })
  nome!: string

  @Column({ type: 'text', nullable: true })
  descricao?: string

  @Column({ type: 'varchar', nullable: false })
  bioma!: string

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: false })
  latitude!: number

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: false })
  longitude!: number

  @Column({ type: 'float', nullable: false })
  largura!: number

  @Column({ type: 'float', nullable: false })
  comprimento!: number

  @Column({ type: 'varchar', nullable: true })
  relevo?: string

  @OneToMany(
    () => Sensor,
    sensor => sensor.area
  )
  sensores!: Relation<Sensor>[]
}
