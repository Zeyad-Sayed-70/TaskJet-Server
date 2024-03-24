import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Auth } from './schemas/auth.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { SignUpAuthDto } from './dto/signup-auth.dto';
import { SignInAuthDto } from './dto/signin-auth.dto.';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name) private readonly AuthModel: Model<Auth>,
    private configService: ConfigService,
  ) {}

  async signup(signUpAuthDto: SignUpAuthDto) {
    try {
      if (!this.isPasswordStrong(signUpAuthDto.password)) {
        throw new HttpException(
          'Password does not meet strength requirements.',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(
        signUpAuthDto.password,
        saltRounds,
      );

      const authData = { ...signUpAuthDto, password: hashedPassword };
      const authDocument = new this.AuthModel(authData);
      const createdAuth = await authDocument.save();

      const token = jwt.sign(
        { id: createdAuth._id },
        this.configService.get('JWT_SECRET_KEY'),
      );

      const resAuth = {
        username: createdAuth.username,
        email: createdAuth.email,
        linkedIn: createdAuth.linkedIn,
      };

      return { token, data: resAuth };
    } catch (error) {
      // Handle errors appropriately
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async signin(
    signInAuthDto: SignInAuthDto,
  ): Promise<{ token: string; data: any }> {
    try {
      // Find the user by email
      const user = await this.AuthModel.findOne({
        email: signInAuthDto.email,
      }).exec();
      if (!user) {
        throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
      }

      // Check if the password is correct
      const isPasswordValid = await bcrypt.compare(
        signInAuthDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new HttpException(
          'Invalid credentials.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // User is authenticated, create and sign the token
      const token = jwt.sign(
        { id: user._id },
        this.configService.get('JWT_SECRET_KEY'),
      );

      // Omit the password when returning the user object
      const { password, ...result } = user.toObject();

      return { token, data: result };
    } catch (error) {
      // Handle errors appropriately
      throw new HttpException(error.message, error.status);
    }
  }

  async getUserData(token: string) {
    try {
      if (!token) throw new HttpException('Token not found', 400);

      const data = jwt.verify(token, this.configService.get('JWT_SECRET_KEY'));
      const _id = (data as any).id;

      return await this.AuthModel.findById(_id).select({
        username: true,
        email: true,
        linkedIn: true,
      });
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  private isPasswordStrong(password: string): boolean {
    // Implement password strength validation logic
    return true;
  }
}
