import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, Index, CreateDateColumn, UpdateDateColumn, BeforeInsert } from "typeorm";
import bcrypt from "bcrypt";
import { Exclude } from "class-transformer";
import AbstractEntity from "./AbstractEntity";

@Entity("users")
export class User extends AbstractEntity {
  constructor(user: Partial<User>) {
    super();
    Object.assign(this, user);
  }

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ type: "text", name: "user_name", unique: true })
  userName: string;

  @Column({ type: "text", name: "first_name", nullable: true })
  firstName: string;

  @Column({ type: "text", name: 'last_name', nullable: true })
  lastName: string;

  @Index()
  @Column({ type: "text", unique: true })
  email: string;

  @Column({ nullable: true })
  dob: Date;

  @Exclude()
  @Column({ type: "text" })
  password: string;

  @Column({ default: false })
  deleted: boolean;

  @BeforeInsert()
  async beforeInsert() {
    this.password = await bcrypt.hash(this.password, 6);
  }
}
