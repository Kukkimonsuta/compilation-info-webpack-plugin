import { Cookie } from './cookie';

export class Jar {
    constructor() {
        this.contents = [
            new Cookie(),
            new Cookie()
        ];
    }
}