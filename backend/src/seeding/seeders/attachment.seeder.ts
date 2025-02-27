import { Factory } from 'typeorm-seeding'
import { Attachment } from '../../entities/attachment.entity'

module.exports = async (factory: Factory, name: string) => {
  return await factory(Attachment)({ name: name }).create()
}
