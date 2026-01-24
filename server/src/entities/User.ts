import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  isAdmin: boolean;
}

export { User, User as UserEntity };
