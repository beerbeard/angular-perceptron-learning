export class RequestModel {

    loop: number;
    type: string;
    rate: number;
    threshold: number;
    speed: number;

    constructor() {

        this.type = 'and';
    }
}