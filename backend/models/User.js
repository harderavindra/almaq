import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        firstName: {type: String,required: true,},
        lastName: {type: String,required: true,},
        gender: {type: String,enum:['male', 'female', 'other'], default: 'male'},
        email: {type: String,required: true,unique: true,},
        password: {type: String,required: true, select: false },
        phone: { type: String,},
        profilePic: {type: String,default: '', },
        role: {type: String, enum: ['admin', 'manager', 'operator','agent', 'delivery_manager', 'viewer'],
            default: 'viewer',
        },
        isActive: {type: Boolean,default: true,},
          // 🆕 For storing hashed refresh token
    refreshToken: {
      type: String,
      select: false, // prevent exposing token
    },
    },
    {
        timestamps: true,
    }
);

// Hash password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
