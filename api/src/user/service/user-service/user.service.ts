import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { exists } from 'fs';
import { from, map, Observable, switchMap } from 'rxjs';
import { UserEntity } from '../../model/user.entity';
import { UserI } from '../../model/user.interface';
import { Repository } from 'typeorm';


const bcrypt = require('bcrypt');

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {}

    create(newUser: UserI): Observable<UserI> {
        return this.mailExists(newUser.email).pipe(
            switchMap((exists: boolean) => {
                if (exists === true) {
                    return this.hashPassword(newUser.password).pipe(
                        switchMap((passwordHash: string) => {
                            newUser.password = passwordHash;
                            return from(this.userRepository.save(newUser)).pipe(
                                switchMap((user: UserI) => this.findOne(user.id))
                            );
                        })
                    )
                } else {
                    throw new HttpException("Email is already in use", HttpStatus.CONFLICT);
                }
            })
        )
    }

    private hashPassword(password: string): Observable<string> {
        return from<string>(bcrypt.hash(password, 12));
    }

    private findOne(id: number): Observable<UserI> {
        return from(this.userRepository.findOne({ where: { id } }));
    }

    private mailExists(email: string): Observable<boolean> {
        return from(this.userRepository.findOne({ where: { email } })).pipe(
            map((user: UserI) => !!user)
        );
    }
}
