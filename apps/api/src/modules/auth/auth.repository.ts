import { UserModel, IUserDocument } from '../../infrastructure/database/models/User.js';

export class AuthRepository {
  async findByEmail(email: string): Promise<IUserDocument | null> {
    return UserModel.findOne({ email: email.toLowerCase() });
  }

  async findById(id: string): Promise<IUserDocument | null> {
    return UserModel.findById(id);
  }

  async createUser(data: { name: string; email: string; passwordHash: string; role?: 'user' | 'admin' }): Promise<IUserDocument> {
    return UserModel.create({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      role: data.role || 'user',
    });
  }

  async updateProfile(id: string, data: { name?: string; email?: string }): Promise<IUserDocument | null> {
    return UserModel.findByIdAndUpdate(
      id,
      {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email.toLowerCase() }),
      },
      { new: true }
    );
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { passwordHash });
  }

  async deleteUser(id: string): Promise<void> {
    await UserModel.findByIdAndDelete(id);
  }
}

export const authRepository = new AuthRepository();
