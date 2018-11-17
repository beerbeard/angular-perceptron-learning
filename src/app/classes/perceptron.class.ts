import { Subject, Observable } from "rxjs";

import { ResultModel } from "../models/result.model";
import { RequestModel } from "../models/request.model";
import { TrainingModel } from "../models/training.model";

export class Perceptron {

    // Training data
    private data: Array<TrainingModel>;

    private weights: Array<number>;

    // Problems variables
    private rate: number = 0.1;
    private threshold: number = 1;

    // Helper variables
    private finished: boolean;
    private speed: number = 1;

    // Debug observables
    private ended: Subject<boolean> = new Subject<boolean>();
    private log: Subject<string> = new Subject<string>();
    private partial: Subject<ResultModel> = new Subject<ResultModel>();
    private task: Subject<string> = new Subject<string>();

    constructor() { }

    /**
     * Start to train the perceptron based on model attributes.
     * @param model Model Perceptron that defines rate, execution speed, limit, number of loops and type of logic gates.
     */
    public practice(model: RequestModel): void {

        this.data = new Array<TrainingModel>();

        // Test with trained weights
        // this.weights = [0.2532422249874937, 0.13654516313079618, -0.2999999999999999];
        
        this.weights = new Array<number>();

        this.finished = false;

        if (model.speed)
            this.speed = model.speed;

        if (model.rate)
            this.rate = model.rate;

        if (model.threshold)
            this.threshold = model.threshold;

        switch (model.type) {

            case 'or':
                this.trainOr();
                break;

            case 'xor':
                this.trainXor();
                break;

            default:
                this.trainAnd();
                break;
        }

        // If the user inserts a loop quantity, the perceptron will converge upon reaching the reported quantity of loops.
        if (model.loop) {

            let index = 0;

            const interval = setInterval(() => {

                // Practice makes perfect (we hope...)
                this.retrain();

                index++;

                if (index === Number(model.loop)) {
                    this.ended.next(true);
                    clearInterval(interval);
                }

            }, this.speed);
        }

        // Else, the perceptron will converge only when "learn" how to solve the logical gate.
        else {
            const interval = setInterval(() => {

                this.retrain();

                if (this.finished) {
                    this.ended.next(true);
                    clearInterval(interval);
                }

            }, this.speed);
        }
    }

    /**
     * "Perceive" what will be the result of the input entered, based on the previous training.
     * @param input Array that you want to know the result.
     */
    public percept(input: Array<number>, weights: Array<number>): number {

        if (weights)
            this.weights = weights;

        let result = 0;

        for (let index = 0; index < input.length; index++)
            result += input[index] * this.weights[index];

        result += this.threshold * this.weights[this.weights.length - 1];

        return this.activation(result, 'sigmod');
    }

    /**
     * Observable that indicates the end of process.
     */
    public getEnd(): Observable<boolean> {
        return this.ended;
    }

    /**
     * Observable that returns the log, every time it's updated.
     */
    public getLog(): Observable<string> {
        return this.log;
    }

    /**
     * Observable that returns the partial result, every time it's updated.
     */
    public getPartial(): Observable<ResultModel> {
        return this.partial;
    }

    /**
     * Observable that returns the current task, every time it's updated.
     */
    public getTask(): Observable<string> {
        return this.task;
    }

    /**
     * Returns the current training data array.
     */
    public getData(): Array<TrainingModel> {
        return this.data;
    }    
    
    /**
    * Returns the current weights array.
    */
   public getWeights(): Array<number> {
       return this.weights;
   }

    /**
     * Feeds the default values to train the perceptron to solve the AND logic gate.
     */
    private trainAnd(): void {

        this.train([0, 0], 0);
        this.train([0, 1], 0);
        this.train([1, 0], 0);
        this.train([1, 1], 1);
    }

    /**
     * Feeds the default values to train the perceptron to solve the OR logic gate.
     */
    private trainOr(): void {

        this.train([0, 0], 0);
        this.train([0, 1], 1);
        this.train([1, 0], 1);
        this.train([1, 1], 1);
    }

    /**
     * Feeds the default values to train the perceptron to solve the XOR logic gate.
     */
    private trainXor(): void {

        this.train([0, 0], 0);
        this.train([0, 1], 1);
        this.train([1, 0], 1);
        this.train([1, 1], 0);
    }

    /**
     * "Train" the perceptron to know how to resolve the logic gate previously informed.
     * @param input Array that you want to train.
     * @param expected Expected result for the array informed.
     */
    private train(input: Array<number>, expected: number): boolean {

        // Starting with random weights, between 0 and 1
        while (this.weights.length < input.length)
            this.weights.push(Math.random());

        // Adding a bias weight for the threshold
        if (this.weights.length === input.length)
            this.weights.push(1);

        // Try to perceive the input informed with the random initial wights
        const result = this.percept(input, null);

        let trained = new TrainingModel;

        trained.input = input;
        trained.previous = result;
        trained.target = expected;

        this.data.push(trained);

        // Debugging
        let partial = new ResultModel();

        partial.training = `${input[0]}, ${input[1]}`;
        partial.expecting = `${expected}`;
        partial.getting = `${result}`;
        partial.weights = this.weights;

        this.log.next(`Treinando: [${input[0]}, ${input[1]}], Esperando: ${expected}, Obtendo: ${result}`);
        this.partial.next(partial);
        this.task.next('Treinando perceptron');

        // If expected value found, actual weights seems like good
        if (result === expected)
            return true;

        // Else, we need to update the wights to execute a new try to solve the problem
        else {

            // Debugging
            this.log.next(`Ajustando pesos. Entrada: [${input[0]}, ${input[1]}], Pesos: ${this.weights}`);
            this.task.next('Ajustando pesos');

            for (let index = 0; index < this.weights.length; index++) {

                const deltaInput = (index === input.length) ? this.threshold : input[index];

                this.adjust(result, expected, deltaInput, index);
            }

            // Debugging
            this.log.next(`Pesos ajustados. Novos pesos: ${this.weights}`);

            return false;
        }
    }

    /**
     * Executes the training method until through the entire data. 
     */
    private retrain(): void {

        const length = this.data.length;

        let success = true;
        let index = 0;

        const interval = setInterval(() => {

            const training = this.data.shift();

            success = this.train(training.input, training.target) && success;

            index++;

            if (index === length) {

                this.finished = success;

                clearInterval(interval);
            }

        }, this.speed);
    }

    /**
     * Calculates the Delta Rule and applies over previous weights.
     * @param result The actual output.
     * @param expected The target output.
     * @param input The input.
     * @param index The index of item on weights array.
     */
    private adjust(result: number, expected: number, input: number, index: number): void {

        // The "rate" represents the learning rate constant on delta rule
        const delta = (expected - result) * this.rate * input;

        this.weights[index] += delta;

        // if (isNaN(this.weights[index]))
        //     throw new Error(`Error: weights[${index}] went to NaN`);
    }

    /**
     * Return if the activation of neuron happens, or not.
     * @param value The value.
     * @param type The activation method.
     */
    private activation(value: number, type: string): number {

        switch (type) {

            case 'sigmod':
                return Number(this.sigmoid(value) >= 0.5);

            default:
                return value;
        }
    }

    /**
     * Returns the result of sigmoidal function.
     * @param value The value.
     */
    private sigmoid(value): number {
        return 1 / (1 + Math.pow(Math.E, -value));
    }
}