import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}


  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { email, password, username } = registerDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.usersService.createUser({
      email,
      username,
      passwordHash: hashedPassword,
    });

    return { message: 'Usuario registrado correctamente' };
  }


  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    return user;
  }


  async login(loginDto: LoginDto): Promise<{ access_token: string ; user:{id:string}}> {

    const user = await this.validateUser(loginDto.email, loginDto.password);

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: '7d',
    });
    /*body: {
    user: User;
    accessToken: string;
    refreshToken: string;
    access_token: string;
  };*/
    return { 
      access_token: token, 
      user:{
        id:user.id 
      }
  }
}
}

