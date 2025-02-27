import { Factory } from 'typeorm-seeding'
import { Role } from '../../entities/role.entity'

module.exports = async (factory: Factory, name: string) => {
  return await factory(Role)({ name: name }).create()
}
