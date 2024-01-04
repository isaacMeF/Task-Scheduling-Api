import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './all-exceptions/all-exceptions.filter';

@Module({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env',
      }),
      
      MongooseModule.forRootAsync({
        useFactory: () => ({
          uri: process.env.MONGO_URL,
          dbName: process.env.MONGO_DB_NAME,
        }),
      }),
      
      UserModule
    ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
