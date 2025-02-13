import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Metadata {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'Unknown System' })
  name: string;

  @Column({ default: 'development' })
  environment: string;

  @Column({ nullable: true })
  location: string;

  @Column('simple-json', { nullable: true })
  tags: Record<string, string>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}