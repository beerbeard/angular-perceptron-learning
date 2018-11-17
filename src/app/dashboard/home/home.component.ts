import { Component, OnInit } from '@angular/core';

import { PerceptronService } from '../../services/perceptron.service';

import { RequestModel } from 'src/app/models/request.model';
import { ResultModel } from 'src/app/models/result.model';
import { OptionModel } from 'src/app/models/option.model';
import { TestModel } from 'src/app/models/test.model';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    public task: string;
    public selected: string;
    public codes: Array<string>;
    public running: boolean;
    public testable: boolean;
    public tested: boolean;
    public model: RequestModel;
    public result: ResultModel;
    public test: TestModel;
    public logs: Array<string>;
    public gates: Array<OptionModel>;
    public options: Array<OptionModel>;
    public testResult: Array<TestModel>;

    constructor(private perceptronService: PerceptronService) { }

    ngOnInit() {

        this.initialize();

        this.perceptronService.getPartial()
            .subscribe(
                (data) => {

                    this.result.expecting = data.expecting;
                    this.result.getting = data.getting;
                    this.result.training = data.training;
                    this.test.item = data.weights;
                },
                (error) => console.log(error)
            );

        this.perceptronService.getTask()
            .subscribe(
                (data) => this.task = data,
                (error) => console.log(error)
            );

        this.perceptronService.getLog()
            .subscribe(
                (data) => this.logs.unshift(data),
                (error) => console.log(error)
            );

        this.perceptronService.getEnd()
            .subscribe(
                () => {
                    this.running = !this.running;
                    this.testable = true;
                },
                (error) => console.log(error)
            );
    }

    public onClick() {

        this.running = true;

        this.logs = [];

        this.perceptronService.practice(this.model);
    }

    public onPercept() {

        this.tested = true;

        let element;
        this.testResult = new Array<TestModel>();

        for (let index = 0; index < this.test.value; index++) {

            element = [];

            element.push(Math.round(Math.random()));
            element.push(Math.round(Math.random()));

            this.testResult.push({
                item: element,
                value: this.perceptronService.percept(element, this.test.item)
            });
        }
    }

    private initialize() {

        this.gates = this.perceptronService.getGates();
        this.options = this.perceptronService.getOptions();

        this.test = new TestModel();
        this.model = new RequestModel();
        this.result = new ResultModel();
        this.logs = new Array<string>();

        this.task = undefined;
        this.running = false;
        this.testable = false;
        this.tested = false;

        this.selected = this.options[0].value;

        this.codes = new Array<string>();
        this.codes[0] = `
private trainAnd(): void {

    this.train([0, 0], 0);
    this.train([0, 1], 0);
    this.train([1, 0], 0);
    this.train([1, 1], 1);
}
        `;
    this.codes[1] = `
private trainOr(): void {

    this.train([0, 0], 0);
    this.train([0, 1], 1);
    this.train([1, 0], 1);
    this.train([1, 1], 1);
}
        `;
    this.codes[2] = `
private trainXor(): void {

    this.train([0, 0], 0);
    this.train([0, 1], 1);
    this.train([1, 0], 1);
    this.train([1, 1], 0);
}
        `;
    }

    isWeighted(): boolean {
        return !this.running && (this.testable || this.test.item.length > 2 && this.test.item[0] !== null && this.test.item[1] !== null && this.test.item[2] !== null);
    }
}
