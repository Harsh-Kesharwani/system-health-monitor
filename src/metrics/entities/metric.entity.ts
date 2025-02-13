import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Metric {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  cpuUsage: number;

  @Column('float')
  memoryUsage: number;

  @Column('float')
  diskUsage: number;

  @CreateDateColumn()
  timestamp: Date;
}