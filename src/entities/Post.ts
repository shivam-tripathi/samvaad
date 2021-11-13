import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import AbstractEntity from "./AbstractEntity";

@Entity("posts")
export default class Post extends AbstractEntity {
	constructor(post: Partial<Post>) {
		super();
		Object.assign(this, post);
	}

	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Index()
	@Column({ type: "text" })
	token: string;

	@Column({ type: "text" })
	title: string;

	@Column({ type: "text", nullable: true })
	body: string;

	@Column({ type: "text" })
	subId: string;
}
