
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export async function appendToSheet(data: any) {
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  const values = [[
    new Date().toISOString(),
    data.firstName,
    data.middleName,
    data.lastName,
    data.dateOfBirth,
    data.gender,
    data.address,
    data.occupation,
    data.education,
    data.phoneNumber,
    data.email,
    data.preferredContact,
    data.twitterHandle,
    data.otherSocial,
    data.whyJoin,
    Array.isArray(data.areasOfInterest) ? data.areasOfInterest.join(', ') : '',
    data.skills,
    Array.isArray(data.availability) ? data.availability.join(', ') : '',
    data.signature,
    data.signatureDate,
    data.fileUrl || 'No file uploaded',
  ]];

  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:U', // Adjust based on your sheet name
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    return response.data;
  } catch (error) {
    console.error('Error appending to sheet:', error);
    throw error;
  }
}

export async function createSheetHeaders() {
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  const headers = [[
    'Timestamp',
    'First Name',
    'Middle Name',
    'Last Name',
    'Date of Birth',
    'Gender',
    'Address',
    'Occupation',
    'Education',
    'Phone Number',
    'Email',
    'Preferred Contact',
    'Twitter Handle',
    'Other Social Media',
    'Why Join',
    'Areas of Interest',
    'Skills',
    'Availability',
    'Signature',
    'Signature Date',
    'Uploaded File URL',
  ]];

  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Sheet1!A1:U1',
      valueInputOption: 'RAW',
      requestBody: { values: headers },
    });

    // Format header row
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.5, blue: 0.8 },
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    bold: true,
                  },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
        ],
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating headers:', error);
    throw error;
  }
}

