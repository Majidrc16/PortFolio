const express = require('express');
const path = require('path');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const recipientEmail = 'majidrc16@gmail.com';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    console.log('--- New Contact Form Submission ---');
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Message: ${message}`);
    console.log('-----------------------------------');

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Please fill in all fields.' });
    }

    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            return res.status(200).json({
                success: true,
                message: 'Your message has been received locally. Add EMAIL_USER and EMAIL_PASS to enable email delivery.'
            });
        }

        await transporter.sendMail({
            from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
            to: recipientEmail,
            replyTo: email,
            subject: `New portfolio inquiry from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: `
                <h3>New Portfolio Inquiry</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `
        });

        return res.status(200).json({
            success: true,
            message: 'Message received successfully! I will get back to you soon.'
        });
    } catch (error) {
        console.error('Email sending failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Message was received, but email delivery failed. Please contact me directly at majidrc16@gmail.com.'
        });
    }
});

app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
