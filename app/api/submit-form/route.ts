
import { NextRequest, NextResponse } from 'next/server';
import { appendToSheet } from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    // Validate required fields
    const requiredFields = [
      'firstName',
      'lastName',
      'dateOfBirth',
      'gender',
      'address',
      'phoneNumber',
      'email',
      'preferredContact',
      'whyJoin',
      'signature',
      'signatureDate',
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate age (15-35)
    const dob = new Date(formData.dateOfBirth);
    const age = new Date().getFullYear() - dob.getFullYear();
    if (age < 15 || age > 35) {
      return NextResponse.json(
        { error: 'Age must be between 15 and 35' },
        { status: 400 }
      );
    }

    // Check consents
    if (!formData.agreeMembership || !formData.agreeDataPrivacy) {
      return NextResponse.json(
        { error: 'Both consent agreements are required' },
        { status: 400 }
      );
    }

    // Append to Google Sheet
    await appendToSheet(formData);

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      whatsappLink: process.env.NEXT_PUBLIC_WHATSAPP_GROUP_LINK,
    });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit form' },
      { status: 500 }
    );
  }
}
