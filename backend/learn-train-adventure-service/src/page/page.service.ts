import { Injectable } from '@nestjs/common';

@Injectable()
export class PageService {
    private readonly page1: String = "hej page 1";
    private readonly page2: String = "hej page 2";

    getPage(pageName: String): String {
        if (pageName === "page1") {
            return this.page1;
        } else if (pageName === "page2") {
            return this.page2;
        }
        return this.page1;
    }

    getPages(): String[] {
        return [this.page1, this.page2];
    }
}
