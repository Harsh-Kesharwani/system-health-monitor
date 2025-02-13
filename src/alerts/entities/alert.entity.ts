import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AlertType {
  CPU = 'cpu',
  MEMORY = 'memory',
  DISK = 'disk',
}

export enum AlertStatus {
  ACTIVE = 'active',
  RESOLVED = 'resolved',
}

@Entity()
export class Alert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: AlertType,
  })
  type: AlertType;

  @Column('float')
  threshold: number;

  @Column('float')
  value: number;

  @Column({
    type: 'enum',
    enum: AlertStatus,
    default: AlertStatus.ACTIVE,
  })
  status: AlertStatus;

  @Column({ nullable: true })
  message: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true, type: 'timestamp' })
  resolvedAt: Date;
}
