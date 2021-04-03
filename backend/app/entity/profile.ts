import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne } from 'typeorm'
import { Title } from './title'

@Entity('profile')
export class Profile extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Title, title => title.id)
    @JoinColumn({ name: 'title_id', referencedColumnName: 'id' })
    title: Title

    @Column({ nullable: true })
    @JoinColumn({ name: 'attatchment_id', referencedColumnName: 'id' })
    avatar_attachment: number

    @Column({ nullable: true })
    description: string

    @Column()
    display_name: string

    @Column()
    experience: number

    @Column()
    rows_scrolled: number

    @Column()
    custom_path: string

    @CreateDateColumn({ nullable: true })
    created_at: Date

    @UpdateDateColumn({ nullable: true })
    updated_at: Date

    @Column({ nullable: true })
    archived_at: Date
}
export default Profile