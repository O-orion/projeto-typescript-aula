import bcrypt from 'bcryptjs'
import { appDataSource } from '../database/appDataSource'
import Pesquisador from '../entities/Pesquisador'
import { AppError } from '../errors/AppError'

class PesquisadorService {
  private pesquisadorRepository = appDataSource.getRepository(Pesquisador)

  public async findAll(): Promise<Pesquisador[]> {
    return await this.pesquisadorRepository.find()
  }

  public async findById(id: string): Promise<Pesquisador> {
    const pesquisador = await this.pesquisadorRepository.findOneBy({ id })

    if (!pesquisador) {
      throw new AppError(404, 'Pesquisador não encontrado')
    }

    return pesquisador
  }

  public async create(data: Pesquisador): Promise<Pesquisador> {
    const { nome, email, senha, matricula, titulacao, dataNascimento } = data

    const emailExiste = await this.pesquisadorRepository.findOneBy({ email })
    const matriculaExiste = await this.pesquisadorRepository.findOneBy({
      matricula,
    })

    if (emailExiste || matriculaExiste) {
      throw new AppError(400, 'E-mail ou Matrícula já cadastrados')
    }

    data.senha = await bcrypt.hash(senha, 10)

    const novoPesquisador = this.pesquisadorRepository.create(data)
    await this.pesquisadorRepository.save(novoPesquisador)
    return novoPesquisador
  }

  public async update(id: string, data: Pesquisador): Promise<Pesquisador> {
    const pesquisadorExiste = await this.pesquisadorRepository.findOneBy({ id })

    if (!pesquisadorExiste) {
      throw new AppError(404, 'Pesquisador não encontrado')
    }

    const updateData = this.pesquisadorRepository.create(data)
    const pesquisadorAtualizado = this.pesquisadorRepository.merge(
      pesquisadorExiste,
      updateData
    )

    await this.pesquisadorRepository.save(pesquisadorAtualizado)
    return pesquisadorAtualizado
  }

  public async delete(id: string): Promise<void> {
    const pesquisador = await this.pesquisadorRepository.findOneBy({ id })

    if (!pesquisador) {
      throw new AppError(404, 'Pesquisador não encontrado')
    }

    await this.pesquisadorRepository.remove(pesquisador)
  }
}

export default PesquisadorService
