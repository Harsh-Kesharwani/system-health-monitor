import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetadataController } from './metadata.controller';
import { MetadataService } from './metadata.service';
import { Metadata } from './entities/metadata.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Metadata])],
  controllers: [MetadataController],
  providers: [MetadataService],
  exports: [MetadataService],
})
export class MetadataModule {}