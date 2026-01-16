import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";

@Injectable()
export class CryptoService {
  private readonly algorithm = "aes-256-gcm";
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const encryptionKey = this.configService.get<string>("ENCRYPTION_KEY");
    if (!encryptionKey || encryptionKey.length < 32) {
      throw new Error("ENCRYPTION_KEY must be at least 32 characters long");
    }
    const salt = this.configService.get<string>("ENCRYPTION_SALT");
    if (!salt || salt.length < 8) {
      throw new Error("ENCRYPTION_SALT must be at least 8 characters long");
    }
    this.key = crypto.scryptSync(
      encryptionKey as crypto.BinaryLike,
      salt as crypto.BinaryLike,
      this.keyLength,
    );
  }

  /**
   * Encrypt a string value
   * Returns base64 encoded string: iv:tag:encrypted
   */
  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(plaintext, "utf8", "base64");
    encrypted += cipher.final("base64");

    const authTag = cipher.getAuthTag();

    // Combine iv, auth tag, and encrypted data
    return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`;
  }

  /**
   * Decrypt an encrypted string
   * Input format: base64 encoded iv:tag:encrypted
   */
  decrypt(encryptedData: string): string {
    const [ivBase64, tagBase64, encrypted] = encryptedData.split(":");

    if (!ivBase64 || !tagBase64 || !encrypted) {
      throw new Error("Invalid encrypted data format");
    }

    const iv = Buffer.from(ivBase64, "base64");
    const authTag = Buffer.from(tagBase64, "base64");

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  /**
   * Hash a value with SHA-256
   */
  hash(value: string): string {
    return crypto.createHash("sha256").update(value).digest("hex");
  }

  /**
   * Generate a secure random token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString("hex");
  }

  /**
   * Generate a secure random string for use as session ID
   */
  generateSessionId(): string {
    return crypto.randomUUID();
  }

  /**
   * Compare two strings in constant time to prevent timing attacks
   */
  secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  }
}
