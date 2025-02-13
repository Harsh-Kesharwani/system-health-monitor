import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { MetadataService } from './metadata.service';
import { CreateMetadataDto, UpdateMetadataDto } from './dto/metadata.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('metadata')
@Controller('api/metadata')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  @Get()
  @ApiOperation({ summary: 'Get all metadata' })
  @ApiResponse({ status: 200, description: 'Return all metadata entries' })
  findAll() {
    return this.metadataService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get metadata by id' })
  @ApiResponse({ status: 200, description: 'Return the metadata entry' })
  @ApiResponse({ status: 404, description: 'Metadata not found' })
  findOne(@Param('id') id: string) {
    return this.metadataService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new metadata' })
  @ApiResponse({
    status: 201,
    description: 'The metadata has been successfully created',
  })
  create(@Body() createMetadataDto: CreateMetadataDto) {
    return this.metadataService.create(createMetadataDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update metadata' })
  @ApiResponse({
    status: 200,
    description: 'The metadata has been successfully updated',
  })
  @ApiResponse({ status: 404, description: 'Metadata not found' })
  update(
    @Param('id') id: string,
    @Body() updateMetadataDto: UpdateMetadataDto,
  ) {
    return this.metadataService.update(+id, updateMetadataDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete metadata' })
  @ApiResponse({
    status: 204,
    description: 'The metadata has been successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'Metadata not found' })
  remove(@Param('id') id: string) {
    return this.metadataService.remove(+id);
  }
}
