import { Controller, Get } from '@nestjs/common';

@Controller('data')
export class DataController {
 
    @Get()
    getPages(): string {
        return 'All data';
    }
}
