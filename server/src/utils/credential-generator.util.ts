/**
 * Utility for generating usernames and passwords for students and parents
 */

export class CredentialGenerator {
  /**
   * Generates a username in the format: role_firstname_randomnumber
   * Example: student_alex_8472 or parent_john_3921
   */
  static generateUsername(role: 'student' | 'parent', firstName: string): string {
    const cleanFirstName = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    return `${role}_${cleanFirstName}_${randomNumber}`;
  }

  /**
   * Generates a secure random password
   * Format: 3 letters + 4 digits + 3 letters (e.g., abc1234def)
   */
  static generatePassword(): string {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';

    let password = '';

    // First 3 letters
    for (let i = 0; i < 3; i++) {
      password += letters.charAt(Math.floor(Math.random() * letters.length));
    }

    // 4 digits
    for (let i = 0; i < 4; i++) {
      password += digits.charAt(Math.floor(Math.random() * digits.length));
    }

    // Last 3 letters
    for (let i = 0; i < 3; i++) {
      password += letters.charAt(Math.floor(Math.random() * letters.length));
    }

    return password;
  }

  /**
   * Generates credentials for both student and parent
   */
  static generateStudentAndParentCredentials(
    studentFirstName: string,
    parentFirstName: string
  ): {
    student: { username: string; password: string };
    parent: { username: string; password: string };
  } {
    return {
      student: {
        username: this.generateUsername('student', studentFirstName),
        password: this.generatePassword(),
      },
      parent: {
        username: this.generateUsername('parent', parentFirstName),
        password: this.generatePassword(),
      },
    };
  }

  /**
   * Regenerates password for a user
   */
  static regeneratePassword(): string {
    return this.generatePassword();
  }

  /**
   * Regenerates username for a user
   */
  static regenerateUsername(role: 'student' | 'parent', firstName: string): string {
    return this.generateUsername(role, firstName);
  }
}