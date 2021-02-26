import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import role from './role';

@Entity()
export class account extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => role, role => role.id)
    @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
    role_id: number;

    @Column({ unique: true })
    user_name: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    email_verified_at: Date;

    @Column()
    password: string;

    @Column()
    last_ip: string;

    @Column({ nullable: true })
    login_attempts_counts: number;

    @Column({ nullable: true, type: 'bigint' })
    locked_to: number;

    @Column({ nullable: true })
    changed_pw_at: Date;
}
export default account;