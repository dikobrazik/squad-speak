import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Room {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column()
	name: string;

	@CreateDateColumn()
	createdAt: Date;
}
