import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import connectToDatabase from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import { VerificationCode } from '@/lib/db/models/VerificationCode'

const resend = new Resend(process.env.RESEND_API_KEY)

// Generate random 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send verification email via Resend
async function sendVerificationEmail(email: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    // In development without API key, just log
    if (!process.env.RESEND_API_KEY) {
      console.log(`[DEV MODE] Verification code for ${email}: ${code}`)
      return { success: true }
    }

    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Daily Companion <onboarding@resend.dev>',
      to: email,
      subject: 'Verify your email - Daily Companion',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 480px; width: 100%; border-collapse: collapse;">
                  <!-- Logo -->
                  <tr>
                    <td align="center" style="padding-bottom: 32px;">
                      <div style="display: inline-flex; align-items: center; gap: 8px;">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                          <span style="color: white; font-size: 20px;">✓</span>
                        </div>
                        <span style="font-size: 24px; font-weight: 700; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Daily Companion</span>
                      </div>
                    </td>
                  </tr>

                  <!-- Card -->
                  <tr>
                    <td style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); padding: 40px;">
                      <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #1e293b; text-align: center;">
                        Verify your email
                      </h1>
                      <p style="margin: 0 0 32px; font-size: 16px; color: #64748b; text-align: center; line-height: 1.5;">
                        Enter this code to complete your registration:
                      </p>

                      <!-- Code Box -->
                      <div style="background: linear-gradient(135deg, #f1f5f9, #e2e8f0); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
                        <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1e293b; font-family: monospace;">
                          ${code}
                        </div>
                      </div>

                      <p style="margin: 0; font-size: 14px; color: #94a3b8; text-align: center;">
                        This code expires in <strong style="color: #64748b;">10 minutes</strong>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding-top: 32px; text-align: center;">
                      <p style="margin: 0 0 8px; font-size: 14px; color: #94a3b8;">
                        If you didn't request this code, you can safely ignore this email.
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #cbd5e1;">
                        © ${new Date().getFullYear()} Daily Companion. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend error:', JSON.stringify(error, null, 2))
      return { success: false, error: error.message || 'Unknown Resend error' }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Failed to send verification email:', error?.message || error)
    return { success: false, error: error?.message || 'Failed to send email' }
  }
}

// POST - Send verification code
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { email, action } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Delete any existing codes for this email
    await VerificationCode.deleteMany({ email: normalizedEmail, type: 'registration' })

    // Generate new code
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Save code to database
    const verification = new VerificationCode({
      email: normalizedEmail,
      code,
      type: 'registration',
      expiresAt,
    })
    await verification.save()

    // Send email
    const result = await sendVerificationEmail(normalizedEmail, code)
    if (!result.success) {
      console.error('Email send failed:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to send verification email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Verification code sent',
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error('Error sending verification code:', error)
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    )
  }
}

// PATCH - Verify code
export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { email, code } = body

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Find the verification record
    const verification = await VerificationCode.findOne({
      email: normalizedEmail,
      type: 'registration',
    })

    if (!verification) {
      return NextResponse.json(
        { error: 'No verification code found. Please request a new one.' },
        { status: 404 }
      )
    }

    // Check if code has expired
    if (new Date() > verification.expiresAt) {
      await VerificationCode.deleteOne({ _id: verification._id })
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Check attempts limit
    if (verification.attempts >= 5) {
      await VerificationCode.deleteOne({ _id: verification._id })
      return NextResponse.json(
        { error: 'Too many failed attempts. Please request a new code.' },
        { status: 400 }
      )
    }

    // Verify code
    if (verification.code !== code) {
      verification.attempts += 1
      await verification.save()
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Mark as verified
    verification.verified = true
    await verification.save()

    return NextResponse.json({
      message: 'Email verified successfully',
      verified: true,
    })
  } catch (error) {
    console.error('Error verifying code:', error)
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    )
  }
}
