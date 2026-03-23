import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('pesquisador')
export default class Pesquisador {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', nullable: false })
  nome!: string

  @Column({ type: 'varchar', nullable: false })
  senha!: string

  @Column({ type: 'varchar', nullable: false })
  especialidade!: string

  @Column({ type: 'varchar', nullable: false, unique: true })
  email!: string

  @Column({ type: 'varchar', nullable: false })
  titulacao!: string

  @Column({ type: 'varchar', nullable: false, unique: true })
  matricula!: string

  @Column({ type: 'varchar', nullable: true })
  linhaPesquisa?: string

  @Column({ type: 'date', nullable: false })
  dataNascimento!: Date
}
