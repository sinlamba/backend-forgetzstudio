import {
  BadRequestException,
  ConflictException,
  HttpException,
  NotFoundException,
} from "@nestjs/common";

export class AppErrorMapper {
  private static readonly errors: Record<string, HttpException> = {
    USERNAME_EXISTS: new ConflictException("Username sudah digunakan"),

    INVALID_PASSWORD: new BadRequestException(
      "Password minimal 8 karakter",
    ),

    PROJECT_NOT_FOUND: new NotFoundException(
      "Project tidak ditemukan",
    ),
  };

  static toHttpException(code: string): HttpException {
    return (
      this.errors[code] ??
      new BadRequestException("Terjadi kesalahan")
    );
  }
}