import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';

@Entity()
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @Column()
  token_hash: string;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  expires_at: Date;

  @Column()
  last_used_at: Date;

  @Column()
  device_id: string;
}
