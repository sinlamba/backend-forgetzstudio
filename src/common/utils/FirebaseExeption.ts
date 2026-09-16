import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  HttpException,
} from "@nestjs/common";

interface FirebaseError {
  code: string;
  message: string;
}

export class FirebaseErrorMapper {
  static toHttpException(error: FirebaseError): HttpException {
    switch (error.code) {
      case "auth/email-already-exists":
        return new ConflictException("Email sudah terdaftar");

      case "auth/invalid-email":
        return new BadRequestException("Email tidak valid");

      case "auth/user-not-found":
        return new BadRequestException("User tidak ditemukan");

      default:
        return new InternalServerErrorException("Terjadi kesalahan pada server");
    }
  }
}