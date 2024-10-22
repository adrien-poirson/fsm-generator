type StateName = string;
type InputSymbol = string;
type Transition = [StateName, InputSymbol, StateName];
type Output<O> = [StateName, O];

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

class InvalidStateError extends Error {
    constructor(state: StateName) {
        super(`Invalid state: ${state}`);
        this.name = "InvalidStateError";
    }
}

class InvalidSymbolError extends Error {
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
    private transitionFunction: Map<string, StateName>;
    private outputFunction: Map<StateName, O>;

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
        this.transitionFunction = new Map();
        this.outputFunction = new Map(config.outputs);

        if (!this.isValidState(this.initialState)) {
            throw new InvalidStateError(this.initialState);
        }

        for (const state of config.acceptingStates) {
            if (!this.isValidState(state)) {
                throw new InvalidStateError(state);
            }
        }

        for (const [fromState, input, toState] of config.transitions) {
            if (!this.isValidState(fromState) || !this.isValidState(toState)) {
                throw new InvalidStateError(`${fromState} or ${toState}`);
            }
            if (!this.isValidSymbol(input)) {
                throw new InvalidSymbolError(input);
            }
            this.transitionFunction.set(`${fromState},${input}`, toState);
        }

        for (const [state] of config.outputs) {
            if (!this.isValidState(state)) {
                throw new InvalidStateError(state);
            }
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
     * @param currentState The current state of the FSM.
     * @param input The input symbol.
     * @returns The next state, or null if no transition is defined.
     * @throws {InvalidStateError} If the current state is invalid.
     * @throws {InvalidSymbolError} If the input symbol is invalid.
     */
    public transition(
        currentState: StateName,
        input: InputSymbol
    ): StateName | null {
        if (!this.isValidState(currentState)) {
            throw new InvalidStateError(currentState);
        }
        if (!this.isValidSymbol(input)) {
            throw new InvalidSymbolError(input);
        }
        const nextState = this.transitionFunction.get(
            `${currentState},${input}`
        );
        return nextState || null;
    }

    /**
     * Checks if a given state is an accepting state.
     * @param state The state to check.
     * @returns True if the state is an accepting state, false otherwise.
     * @throws {InvalidStateError} If the state is invalid.
     */
    public isAcceptingState(state: StateName): boolean {
        if (!this.isValidState(state)) {
            throw new InvalidStateError(state);
        }
        return this.acceptingStates.has(state);
    }

    /**
     * Gets the output associated with a given state.
     * @param state The state to get the output for.
     * @returns The output associated with the state, or undefined if no output is defined.
     * @throws {InvalidStateError} If the state is invalid.
     */
    public getOutput(state: StateName): O | undefined {
        if (!this.isValidState(state)) {
            throw new InvalidStateError(state);
        }
        return this.outputFunction.get(state);
    }

    /**
     * Processes an input string through the FSM.
     * @param input The input string to process.
     * @returns An object containing whether the input was accepted, the output (if any), and the final state.
     * @throws {InvalidSymbolError} If any symbol in the input is invalid.
     * @throws {Error} If no transition is defined for a given state and input combination.
     */
    public process(input: string): ProcessResult<O> {
        this.currentState = this.initialState;
        for (const symbol of input) {
            if (!this.isValidSymbol(symbol)) {
                throw new InvalidSymbolError(symbol);
            }
            const nextState = this.transition(this.currentState, symbol);
            if (nextState === null) {
                throw new Error(
                    `No transition defined for state ${this.currentState} with input ${symbol}`
                );
            }
            this.currentState = nextState;
        }

        const output = this.getOutput(this.currentState);
        return {
            accepted: this.isAcceptingState(this.currentState),
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

        this.transitionFunction.forEach((toState, key) => {
            const [fromState, input] = key.split(",");
            structure.transitions.push([fromState, input, toState]);
        });

        this.outputFunction.forEach((output, state) => {
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
}