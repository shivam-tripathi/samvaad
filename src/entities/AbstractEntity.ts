import { classToPlain } from "class-transformer";
import { BaseEntity, CreateDateColumn, UpdateDateColumn } from "typeorm";

export default abstract class Entity extends BaseEntity {

	@CreateDateColumn({ name: "created_at" })
	createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt: Date;

	toJSON() {
		classToPlain(this);
	}
}
