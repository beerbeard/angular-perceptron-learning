import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Perceptron } from '../classes/perceptron.class';

import { ResultModel } from '../models/result.model';
import { RequestModel } from '../models/request.model';
import { OptionModel } from '../models/option.model';

@Injectable()
export class PerceptronService {

    private perceptron: Perceptron;

    private gates: Array<OptionModel> = [
        { name: 'AND', value: 'and' },
        { name: 'OR', value: 'or' },
        { name: 'XOR (não recomendado)', value: 'xor' }
    ];

    private options: Array<OptionModel> = [
        { name: 'Tabela de dados', value: 'data' },
        { name: 'Tabela de pesos', value: 'weight' },
        { name: 'Tabela de logs', value: 'log' }
    ];

    constructor() {
        this.perceptron = new Perceptron();
    }

    public practice(model: RequestModel): void {
        this.perceptron.practice(model);
    }

    public percept(input: Array<number>, weights: Array<number>): number {
        return this.perceptron.percept(input, weights);
    }

    public getPartial(): Observable<ResultModel> {
        return this.perceptron.getPartial();
    }

    public getTask(): Observable<string> {
        return this.perceptron.getTask();
    }

    public getLog(): Observable<string> {
        return this.perceptron.getLog();
    }

    public getEnd(): Observable<boolean> {
        return this.perceptron.getEnd();
    }

    public getGates(): Array<OptionModel> {
        return this.gates;
    }

    public getOptions(): Array<OptionModel> {
        return this.options;
    }
}
