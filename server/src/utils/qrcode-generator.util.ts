import * as QRCode from 'qrcode';

export class QRCodeGenerator {
  /**
   * Generates a QR code as a data URL for credentials
   */
  static async generateCredentialsQRCode(
    username: string,
    password: string,
    role: 'student' | 'parent'
  ): Promise<string> {
    const credentialData = JSON.stringify({
      username,
      password,
      role,
      appName: 'Lingoshid',
    });

    try {
      // Generate QR code as data URL
      const qrCodeDataURL = await QRCode.toDataURL(credentialData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 1,
      });

      return qrCodeDataURL;
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  /**
   * Generates QR codes for both student and parent
   */
  static async generateStudentAndParentQRCodes(
    studentUsername: string,
    studentPassword: string,
    parentUsername: string,
    parentPassword: string
  ): Promise<{
    studentQRCode: string;
    parentQRCode: string;
  }> {
    const [studentQRCode, parentQRCode] = await Promise.all([
      this.generateCredentialsQRCode(studentUsername, studentPassword, 'student'),
      this.generateCredentialsQRCode(parentUsername, parentPassword, 'parent'),
    ]);

    return {
      studentQRCode,
      parentQRCode,
    };
  }
}