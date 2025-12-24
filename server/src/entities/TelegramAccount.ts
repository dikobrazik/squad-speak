import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class TelegramAccount {
  // telegram id
  @PrimaryColumn()
  id: string;

  @OneToOne(
    () => User,
    (user) => user.id,
  )
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @Column()
  username: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  photo_path: string;
}
