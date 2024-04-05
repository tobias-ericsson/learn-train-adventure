import { Controller, Get } from '@nestjs/common';
import { PageService } from './page.service';

@Controller('page')
export class PageController {

    constructor(private pageService: PageService) {}



  @Get()
  async findAll(): Promise<String[]> {
    return this.pageService.getPages();
  }
}
