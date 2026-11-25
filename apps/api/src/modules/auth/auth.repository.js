import { UserModel } from '../../infrastructure/database/models/User.js';
export class AuthRepository {
    async findByEmail(email) {
        return UserModel.findOne({ email: email.toLowerCase() });
    }
    async findById(id) {
        return UserModel.findById(id);
    }
    async createUser(data) {
        return UserModel.create({
            name: data.name,
            email: data.email.toLowerCase(),
            passwordHash: data.passwordHash,
            role: data.role || 'user',
        });
    }
    async updateProfile(id, data) {
        return UserModel.findByIdAndUpdate(id, {
            ...(data.name && { name: data.name }),
            ...(data.email && { email: data.email.toLowerCase() }),
        }, { new: true });
    }
    async updatePassword(id, passwordHash) {
        await UserModel.findByIdAndUpdate(id, { passwordHash });
    }
    async deleteUser(id) {
        await UserModel.findByIdAndDelete(id);
    }
}
export const authRepository = new AuthRepository();
