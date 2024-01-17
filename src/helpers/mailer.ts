import nodemailer from "nodemailer";
import User from "@/models/user";
import bcryptjs from 'bcryptjs';
import { emailType } from "@/constants/emailTypes";

const emailTypeActions = async (type: emailType, userId: String, hashedToken: String) => {
    switch (type) {
        case emailType.VERIFY_EMAIL:
            await User.findByIdAndUpdate(userId, {
                verifyEmailToken: hashedToken,
                verifyEmailTokenExpiry: Date.now() + 3600000
            });
            break;
        case emailType.RESET_PASSWORD:
            await User.findByIdAndUpdate(userId, {
                forgotPasswordToken: hashedToken,
                forgotPasswordTokenExpiry: Date.now() + 3600000
            });
            break;
        default:
            break;
    }
};

const getEmailSubject = (type: emailType) => {
    switch (type) {
        case emailType.VERIFY_EMAIL:
            return "Verify your email";
        case emailType.RESET_PASSWORD:
            return "Reset your password";
        case emailType.ONBOARD_EMAIL:
            return "Thanks for verifying your email";
        default:
            return "";
    }
};


const getEmailBody = (type: emailType, hashedToken: string, otp: string): string => {
    switch (type) {
        case emailType.VERIFY_EMAIL:
            return `<p>To complete your email verification, please click <a href="${process.env.DOMAIN}/api/mobile/users/verifyemail?token=${hashedToken}">here</a> 
                    or copy and paste the following link into your browser: 
                    <br> ${process.env.DOMAIN}/api/mobile/users/verifyemail?token=${hashedToken}
                    </p>`;
        case emailType.RESET_PASSWORD:
            return `<p>Your OTP: ${otp}</p>`;
        case emailType.ONBOARD_EMAIL:
            return `<p>Thank you for verifying your email. You can now contribute your unique set of questions, shaping the experience for all users, including yourself.
                    <p>Get ready to explore and make your mark! 🚀</p>`;
        default:
            return "";
    }
};


export const sendEmail = async ({ email, type, user }: any) => {
    try {
        let otp = "";
        if (type === emailType.RESET_PASSWORD) {
            otp = generateOTP();
        }
        const hashedToken = (type === emailType.VERIFY_EMAIL) ?
            await bcryptjs.hash(user._id.toString(), 10) :
            await bcryptjs.hash(email.toString() + otp, 10);

        await emailTypeActions(type, user, hashedToken);

        const transport = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: getEmailSubject(type),
            html: getEmailBody(type, hashedToken, otp),
        };

        await transport.sendMail(mailOptions);
    } catch (error: any) {
        throw new Error(error.message);
    }
};


const generateOTP = () => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    return otp;
}