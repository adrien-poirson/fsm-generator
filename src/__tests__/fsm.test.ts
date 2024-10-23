import FiniteStateMachine, {
    Transition,
    Output,
    InvalidSymbolError,
    InvalidStateError,
} from "../index";

describe("FiniteStateMachine", () => {
    const config = {
        states: ["A", "B", "C"],
        alphabet: ["0", "1"],
        initialState: "A",
        acceptingStates: ["C"],
        transitions: [
            ["A", "0", "B"],
            ["A", "1", "A"],
            ["B", "0", "C"],
            ["B", "1", "A"],
            ["C", "0", "C"],
            ["C", "1", "C"],
        ] as Transition[],
        outputs: [
            ["A", "Output A"],
            ["B", "Output B"],
            ["C", "Output C"],
        ] as Output<string>[],
    };

    let fsm: FiniteStateMachine<string>;

    beforeEach(() => {
        fsm = new FiniteStateMachine(config);
    });

    test("should initialize correctly", () => {
        expect(fsm.getCurrentState()).toBe("A");
    });

    test("should transition correctly", () => {
        expect(fsm.transition("0")).toBe("B");
        expect(fsm.transition("0")).toBe("C");
        expect(fsm.transition("1")).toBe("C");
    });

    test("should process input correctly", () => {
        const result = fsm.process("001");
        expect(result.accepted).toBe(true);
        expect(result.output).toBe("Output C");
        expect(result.finalState).toBe("C");
    });

    test("should reject invalid input", () => {
        expect(() => fsm.process("002")).toThrow();
    });

    test("FSM operations", () => {
        const fsm = new FiniteStateMachine(config);

        expect(fsm.getCurrentState()).toBe("A");
        expect(fsm.getOutput()).toBe("Output A");
        expect(fsm.isInAcceptingState()).toBe(false);
        expect(fsm.transition("0")).toBe("B");
        expect(fsm.transition("0")).toBe("C");
        expect(fsm.isInAcceptingState()).toBe(true);
        expect(fsm.getOutput()).toBe("Output C");
        expect(fsm.transition("1")).toBe("C");
        expect(fsm.isInAcceptingState()).toBe(true);
        expect(fsm.getOutput()).toBe("Output C");
    });

    test("should get structure correctly", () => {
        const structure = JSON.parse(fsm.getStructure());
        expect(structure).toEqual(config);
    });

    test("handles empty input string", () => {
        const result = fsm.process("");
        expect(result.accepted).toBe(false);
        expect(result.finalState).toBe("A");
        expect(result.output).toBe("Output A");
    });

    test("processes long input string correctly", () => {
        const result = fsm.process("01".repeat(100) + "1");
        expect(result.accepted).toBe(false);
        expect(result.finalState).toBe("A");
        expect(result.output).toBe("Output A");
    });

    test("handles transitions back to the same state", () => {
        const loopyFSM = new FiniteStateMachine<string>({
            states: ["S"],
            alphabet: ["a", "b"],
            initialState: "S",
            acceptingStates: ["S"],
            transitions: [
                ["S", "a", "S"],
                ["S", "b", "S"],
            ],
            outputs: [["S", "Loopy output"]],
        });
        const result = loopyFSM.process("abababab");
        expect(result.accepted).toBe(true);
        expect(result.finalState).toBe("S");
        expect(result.output).toBe("Loopy output");
    });

    test("throws error for invalid input symbol", () => {
        expect(() => fsm.process("012")).toThrow(InvalidSymbolError);
    });

    test("throws error for invalid state transition", () => {
        expect(() => {
            new FiniteStateMachine({
                states: ["A", "B", "C"],
                alphabet: ["0", "1"],
                initialState: "A",
                acceptingStates: ["C"],
                transitions: [
                    ["A", "0", "B"],
                    ["B", "1", "C"],
                    ["S", "0", "T"], // Invalid states S and T
                ],
                outputs: [["C", "Output C"]],
            });
        }).toThrow(InvalidStateError);
    });

    test("correctly identifies accepting states", () => {
        expect(fsm.isInAcceptingState()).toBe(false);
        expect(fsm.getCurrentState()).toBe("A");
        fsm.process("00"); // Move to state C
        expect(fsm.isInAcceptingState()).toBe(true);
        expect(fsm.getCurrentState()).toBe("C");
    });

    test("handles states with no defined output", () => {
        const noOutputFSM = new FiniteStateMachine<string>({
            states: ["S", "T"],
            alphabet: ["a"],
            initialState: "S",
            acceptingStates: ["T"],
            transitions: [["S", "a", "T"]],
            outputs: [], // No outputs defined
        });
        const result = noOutputFSM.process("a");
        expect(result.accepted).toBe(true);
        expect(result.finalState).toBe("T");
        expect(result.output).toBe(null);
    });
});
