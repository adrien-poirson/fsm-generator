type StateName = string;
type InputSymbol = string;
export type Transition = [StateName, InputSymbol, StateName];
export type Output<O> = [StateName, O];

export type FSMConfig<O> = {
    states: StateName[];
    alphabet: InputSymbol[];
    initialState: StateName;
    acceptingStates: StateName[];
    transitions: Transition[];
    outputs: Output<O>[];
};

type ProcessResult<O> = {
    accepted: boolean;
    output: O | null;
    finalState: StateName;
};

type StructureFormat = "json" | "object";

export class InvalidStateError extends Error {
    constructor(state: StateName) {
        super(`Invalid state: ${state}`);
        this.name = "InvalidStateError";
    }
}

export class InvalidSymbolError extends Error {
    constructor(symbol: InputSymbol) {
        super(`Invalid input symbol: ${symbol}`);
        this.name = "InvalidSymbolError";
    }
}

/**
 * Represents a Finite State Machine (FSM) with customizable output type.
 * @template O The type of the output produced by the FSM.
 */
export default class FiniteStateMachine<O> {
    private states: Set<StateName>;
    private alphabet: Set<InputSymbol>;
    private initialState: StateName;
    private currentState: StateName;
    private acceptingStates: Set<StateName>;
    private transitionMap: Map<string, StateName>;
    private outputMap: Map<StateName, O>;

    /**
     * Creates a new Finite State Machine.
     * @param config The configuration object for the FSM.
     */
    constructor(config: FSMConfig<O>) {
        this.states = new Set(config.states);
        this.alphabet = new Set(config.alphabet);
        this.initialState = config.initialState;
        this.currentState = this.initialState;
        this.acceptingStates = new Set(config.acceptingStates);
        this.transitionMap = new Map();
        this.outputMap = new Map(config.outputs);

        this.validateStates(config);
        this.buildTransitionMap(config.transitions);
    }

    private validateStates(config: FSMConfig<O>) {
        if (!this.isValidState(this.initialState)) {
            throw new InvalidStateError(this.initialState);
        }

        for (const state of config.acceptingStates) {
            if (!this.isValidState(state)) {
                throw new InvalidStateError(state);
            }
        }

        for (const [state] of config.outputs) {
            if (!this.isValidState(state)) {
                throw new InvalidStateError(state);
            }
        }
    }

    private buildTransitionMap(transitions: Transition[]) {
        for (const [fromState, input, toState] of transitions) {
            if (!this.isValidState(fromState) || !this.isValidState(toState)) {
                throw new InvalidStateError(
                    this.isValidState(fromState) ? toState : fromState
                );
            }
            if (!this.isValidSymbol(input)) {
                throw new InvalidSymbolError(input);
            }
            this.transitionMap.set(`${fromState},${input}`, toState);
        }
    }

    /**
     * Checks if a given state is valid for this FSM.
     * @param state The state to check.
     * @returns True if the state is valid, false otherwise.
     */
    public isValidState(state: StateName): boolean {
        return this.states.has(state);
    }

    /**
     * Checks if a given symbol is valid for this FSM's alphabet.
     * @param symbol The symbol to check.
     * @returns True if the symbol is valid, false otherwise.
     */
    public isValidSymbol(symbol: InputSymbol): boolean {
        return this.alphabet.has(symbol);
    }

    /**
     * Performs a state transition based on the current state and input symbol.
     * @param input The input symbol.
     * @returns The next state, or null if no transition is defined.
     * @throws {InvalidSymbolError} If the input symbol is invalid.
     */
    public transition(input: InputSymbol): StateName | null {
        if (!this.isValidSymbol(input)) {
            throw new InvalidSymbolError(input);
        }
        const nextState = this.transitionMap.get(
            `${this.currentState},${input}`
        );
        if (nextState) {
            this.currentState = nextState;
        }
        return nextState || null;
    }

    /**
     * Checks if the current state is an accepting state.
     * @returns True if the current state is an accepting state, false otherwise.
     */
    public isInAcceptingState(): boolean {
        return this.acceptingStates.has(this.currentState);
    }

    /**
     * Gets the output associated with the current state.
     * @returns The output associated with the current state, or undefined if no output is defined.
     */
    public getOutput(): O | undefined {
        return this.outputMap.get(this.currentState);
    }

    /**
     * Processes an input string through the FSM.
     * @param input The input string to process.
     * @returns An object containing whether the input was accepted, the output (if any), and the final state.
     * @throws {InvalidSymbolError} If any symbol in the input is invalid.
     * @throws {Error} If no transition is defined for a given state and input combination.
     */
    public process(input: string): ProcessResult<O> {
        this.reset();
        for (const symbol of input) {
            const nextState = this.transition(symbol);
            if (nextState === null) {
                throw new Error(
                    `No transition defined for state ${this.currentState} with input ${symbol}`
                );
            }
        }
        return this.getProcessResult();
    }

    private getProcessResult(): ProcessResult<O> {
        const output = this.getOutput();
        return {
            accepted: this.isInAcceptingState(),
            output: output !== undefined ? output : null,
            finalState: this.currentState,
        };
    }

    /**
     * Returns the structure of the Finite State Machine.
     * @param format - The desired format of the structure. Can be 'json' for a JSON string or 'object' for a JavaScript object. Defaults to JSON.
     * @returns The FSM structure in the specified format.
     */
    public getStructure<T extends StructureFormat = "json">(
        format: T = "json" as T
    ): T extends "json" ? string : FSMConfig<O> {
        const structure: FSMConfig<O> = {
            states: Array.from(this.states),
            alphabet: Array.from(this.alphabet),
            initialState: this.initialState,
            acceptingStates: Array.from(this.acceptingStates),
            transitions: [],
            outputs: [],
        };

        this.transitionMap.forEach((toState, key) => {
            const [fromState, input] = key.split(",");
            structure.transitions.push([fromState, input, toState]);
        });

        this.outputMap.forEach((output, state) => {
            structure.outputs.push([state, output]);
        });

        return (
            format === "json" ? JSON.stringify(structure, null, 2) : structure
        ) as any;
    }

    /**
     * Returns the current state of the FSM.
     * @returns The current state name.
     */
    public getCurrentState(): StateName {
        return this.currentState;
    }

    /**
     * Resets the FSM to its initial state.
     */
    public reset(): void {
        this.currentState = this.initialState;
    }
}
