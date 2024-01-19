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
        case emailType.NORMAL_WELCOME:
            return "Welcome to Song Quest"
        default:
            return "";
    }
};


const getEmailBody = (type: emailType, hashedToken: string, otp: string, user: any): string => {
    switch (type) {
        case emailType.VERIFY_EMAIL:
            return `<p>To complete your email verification, please click <a href="${process.env.DOMAIN}/api/mobile/users/verifyemail?token=${hashedToken}">here</a> 
                    or copy and paste the following link into your browser: 
                    <br> ${process.env.DOMAIN}/api/mobile/users/verifyemail?token=${hashedToken}
                    </p>`;
        case emailType.RESET_PASSWORD:
            return `<!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        background-color: #f4f4f4;
                        color: #333;
                        padding: 20px;
                    }
                    
                    .forgot-password-container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    h3 {
                        color: #007BFF;
                    }
                    p {
                        line-height: 1.6;
                    }
                    a {
                        color: #007BFF;
                        text-decoration: none;
                        font-weight: bold;
                    }
                    strong {
                        font-size: 1.4em;
                    }
                </style>
                </head>
                <body>
                <div class="forgot-password-container">
                    <h3>Hi ${user.username},</h3>
                    <p>We received a request to reset your Song Quest password.</p>
                    <p>Your One-Time Password (OTP) for password reset is: <strong>${otp}</strong></p>
                    <p>This OTP will expire in 15 minutes. If you didn't request a password reset, you can ignore this email.</p>
                    <p>If you have any questions or need further assistance, feel free to reply to this email.</p>
                    <p>Happy questing with Song Quest!</p>
                </div>
                </body>
                </html>`;
        case emailType.ONBOARD_EMAIL:
            return `<p>Thank you for verifying your email. You can now contribute your unique set of questions, shaping the experience for all users, including yourself.
                    <p>Get ready to explore and make your mark! 🚀</p>`;
        case emailType.NORMAL_WELCOME:
            return `<!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        background-color: #f4f4f4;
                        color: #333;
                        padding: 20px;
                    }
                    .welcome-container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    h3 {
                        color: #007BFF;
                    }
                    p {
                        line-height: 1.6;
                    }   
                    a {
                        color: #007BFF;
                        text-decoration: none;
                        font-weight: bold;
                    }
                </style>
                </head>
                <body>
                <div class="welcome-container">
                    <h3>Hi ${user.username},</h3>
                    <p>Welcome to <b>Song Quest 🚀</b></p>
                    <p> Thank you for signing up. I am excited to have you on board. Get ready to immerse yourself in the world of music and make your mark as a Song Quester!</p>
                    <p>If you have any questions or need assistance, feel free to reply to this mail.</p>
                    <p>Happy questing with Song Quest!</p>
                    <p>By the way, did you know this project is open source? You can check out the code on the GitHub repository <a href="https://github.com/spongycode/song-quest" target="_blank">here</a>.</p>
                </div>
                </body>
                </html>`;
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
            html: getEmailBody(type, hashedToken, otp, user),
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