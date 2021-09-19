import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, Index, CreateDateColumn, UpdateDateColumn, BeforeInsert } from "typeorm";
import bcrypt from "bcrypt";
import { classToPlain, Exclude } from "class-transformer";
@Entity("users")
export class User extends BaseEntity {
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

  @CreateDateColumn({ name: "created_at " })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at " })
  updatedAt: Date;

  @BeforeInsert()
  async beforeInsert() {
    this.password = await bcrypt.hash(this.password, 6);
  }

  toJSON() {
    return classToPlain(this);
  }
}
