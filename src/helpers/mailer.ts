import nodemailer from "nodemailer";
import User from "@/models/user";
import bcryptjs from 'bcryptjs';


export const sendEmail = async ({ email, emailType, userId }: any) => {
    try {
        const hashedToken = await bcryptjs.hash(userId.toString(), 10)

        if (emailType === "VERIFY") {
            await User.findByIdAndUpdate(userId,
                { verifyEmailToken: hashedToken, verifyEmailTokenExpiry: Date.now() + 3600000 })
        }

        var transport = nodemailer.createTransport({
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
            subject: emailType === "VERIFY" ? "Verify your email" : "",
            html: emailType === "VERIFY" ?
                `<p>Click <a href="${process.env.DOMAIN}/api/mobile/users/verifyemail?token=${hashedToken}">here</a> 
                to verify your email or copy and paste the link below in your browser. 
                <br> ${process.env.DOMAIN}/api/mobile/users/verifyemail?token=${hashedToken}
                </p>`
                : ""
        }

        await transport.sendMail(mailOptions);

    } catch (error: any) {
        throw new Error(error.message);
    }
}