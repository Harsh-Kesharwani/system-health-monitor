import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Metadata } from './entities/metadata.entity';
import { CreateMetadataDto, UpdateMetadataDto } from './dto/metadata.dto';

@Injectable()
export class MetadataService {
  constructor(
    @InjectRepository(Metadata)
    private metadataRepository: Repository<Metadata>,
  ) {}

  async findAll(): Promise<Metadata[]> {
    return this.metadataRepository.find();
  }

  async findOne(id: number): Promise<Metadata> {
    const metadata = await this.metadataRepository.findOne({ where: { id } });
    if (!metadata) {
      throw new NotFoundException(`Metadata with ID ${id} not found`);
    }
    return metadata;
  }

  async create(createMetadataDto: CreateMetadataDto): Promise<Metadata> {
    const metadata = this.metadataRepository.create(createMetadataDto);
    return this.metadataRepository.save(metadata);
  }

  async update(id: number, updateMetadataDto: UpdateMetadataDto): Promise<Metadata> {
    const metadata = await this.findOne(id);
    Object.assign(metadata, updateMetadataDto);
    return this.metadataRepository.save(metadata);
  }

  async remove(id: number): Promise<void> {
    const metadata = await this.findOne(id);
    await this.metadataRepository.remove(metadata);
  }
}