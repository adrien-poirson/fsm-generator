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
/**
 * Represents a Finite State Machine (FSM) with customizable output type.
 * @template O The type of the output produced by the FSM.
 */
export default class FiniteStateMachine<O> {
    private states;
    private alphabet;
    private initialState;
    private currentState;
    private acceptingStates;
    private transitionFunction;
    private outputFunction;
    /**
     * Creates a new Finite State Machine.
     * @param config The configuration object for the FSM.
     */
    constructor(config: FSMConfig<O>);
    /**
     * Checks if a given state is valid for this FSM.
     * @param state The state to check.
     * @returns True if the state is valid, false otherwise.
     */
    isValidState(state: StateName): boolean;
    /**
     * Checks if a given symbol is valid for this FSM's alphabet.
     * @param symbol The symbol to check.
     * @returns True if the symbol is valid, false otherwise.
     */
    isValidSymbol(symbol: InputSymbol): boolean;
    /**
     * Performs a state transition based on the current state and input symbol.
     * @param currentState The current state of the FSM.
     * @param input The input symbol.
     * @returns The next state, or null if no transition is defined.
     * @throws {InvalidStateError} If the current state is invalid.
     * @throws {InvalidSymbolError} If the input symbol is invalid.
     */
    transition(currentState: StateName, input: InputSymbol): StateName | null;
    /**
     * Checks if a given state is an accepting state.
     * @param state The state to check.
     * @returns True if the state is an accepting state, false otherwise.
     * @throws {InvalidStateError} If the state is invalid.
     */
    isAcceptingState(state: StateName): boolean;
    /**
     * Gets the output associated with a given state.
     * @param state The state to get the output for.
     * @returns The output associated with the state, or undefined if no output is defined.
     * @throws {InvalidStateError} If the state is invalid.
     */
    getOutput(state: StateName): O | undefined;
    /**
     * Processes an input string through the FSM.
     * @param input The input string to process.
     * @returns An object containing whether the input was accepted, the output (if any), and the final state.
     * @throws {InvalidSymbolError} If any symbol in the input is invalid.
     * @throws {Error} If no transition is defined for a given state and input combination.
     */
    process(input: string): ProcessResult<O>;
    /**
     * Returns the structure of the Finite State Machine.
     * @param format - The desired format of the structure. Can be 'json' for a JSON string or 'object' for a JavaScript object. Defaults to JSON.
     * @returns The FSM structure in the specified format.
     */
    getStructure<T extends StructureFormat = "json">(format?: T): T extends "json" ? string : FSMConfig<O>;
    /**
     * Returns the current state of the FSM.
     * @returns The current state name.
     */
    getCurrentState(): StateName;
}
export {};
