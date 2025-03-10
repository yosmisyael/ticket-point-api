import { HttpException, Injectable } from '@nestjs/common';
import { UplaodFileDto } from './dto/file.dto';
import * as path from 'node:path';
import { v4 as uuidV4 } from 'uuid';
import * as fs from 'fs';
import { ValidationService } from '../common/validation.service';
import { FileValidation } from './file.validation';
import { UserService } from '../user/user.service';

@Injectable()
export class FileService {
  private publicDir: string = 'public';

  constructor(
    private readonly validationService: ValidationService,
    private readonly userService: UserService,
  ) {
  }

  async uplaodImage(file: Express.Multer.File, ctx: UplaodFileDto) {
    const data: UplaodFileDto = await this.validationService.validate(FileValidation.UPLOAD, ctx);

    await this.userService.getUserById(Number(data.id));

    this.validateFile(file);

    const uploadDir = this.getUploadDirectoryPath(data);

    this.verifyDirectoryExists(uploadDir);

    const filename = this.generateFilename(file, data);

    const path2File = path.join(uploadDir, filename);

    await this.deleteExistingFile(data);

    fs.renameSync(file.path, path2File);

    return {
      filename: file.filename,
      path: path2File,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  private getUploadDirectoryPath(context: UplaodFileDto): string {
    return path.join(this.publicDir, context.type);
  }

  private verifyDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private generateFilename(file: Express.Multer.File, context: UplaodFileDto): string {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const uuid = uuidV4();

    return `${context.id}-${context.type}${context.subType ? `-${context.subType}` : ''}-${uuid}${fileExtension}`;
  }

  private validateFile(file: Express.Multer.File): void {
    const maxSize = 3 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new HttpException(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`, 400);
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new HttpException(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`, 400);
    }
  }

  async deleteExistingFile(context: UplaodFileDto): Promise<boolean> {
    const dir = this.getUploadDirectoryPath(context);

    try {
      if (!fs.existsSync(dir)) {
        return false;
      }

      const files = fs.readdirSync(dir);

      const pattern = `${context.id}-${context.type}${context.subType ? `-${context.subType}` : ''}`;

      let deleted = false;
      for (const file of files) {
        if (file.startsWith(pattern)) {
          fs.unlinkSync(path.join(dir, file));
          deleted = true;
        }
      }

      return deleted;
    } catch (error) {
      return false;
    }
  }
}
