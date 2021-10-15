import { Module } from '@nestjs/common'
import { AuthorizationModule } from './modules/authorization.module'
import { BanModule } from './modules/ban.module'
import { CommentModule } from './modules/comment.module'
import { PostModule } from './modules/post.module'
import { ProfileModule } from './modules/profile.module'
import { RoleModule } from './modules/role.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { configValidationSchema } from './config.schema'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      validationSchema: configValidationSchema
    }),
    AuthorizationModule,
    BanModule,
    CommentModule,
    PostModule,
    ProfileModule,
    RoleModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME'),
          autoLoadEntities: true,
          synchronize: true
        }
      }
    })
  ],
})
export class AppModule {}
