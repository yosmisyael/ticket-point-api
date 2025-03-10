import {
  Body,
  Controller,
  Post,
  UploadedFile, UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { UplaodFileDto } from './dto/file.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';

@Controller('/api/image')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('/upload')
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile() image: Express.Multer.File, @Body() req: UplaodFileDto) {
    return await this.fileService.uplaodImage(image, req);
  }
}
