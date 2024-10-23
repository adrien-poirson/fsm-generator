# Finite State Machine (FSM) Implementation

This package provides a flexible and type-safe implementation of a Finite State Machine in TypeScript.

## Features

-   Type-safe implementation
-   Support for custom output types
-   Easy configuration through a simple object structure
-   Methods for state transitions, output retrieval, and machine reset

## Installation

````bash
npm install fsm-generator


## Usage

To use this FSM, you need to define your states, alphabet (input symbols), transitions, and outputs.

```typescript
import FiniteStateMachine from 'fsm-generator';

const trafficLightFSM = new FiniteStateMachine({
  states: ['Red', 'Yellow', 'Green'],
  alphabet: ['Next'],
  initialState: 'Red',
  acceptingStates: ['Red', 'Green'],
  transitions: [
    { from: 'Red', input: 'Next', to: 'Green' },
    { from: 'Green', input: 'Next', to: 'Yellow' },
    { from: 'Yellow', input: 'Next', to: 'Red' },
  ],
  outputs: [
    ['Red', 'Stop'],
    ['Yellow', 'Prepare to stop'],
    ['Green', 'Go'],
  ],
});


### Methods

- `transition(currentState: StateName, input: InputSymbol): StateName | null` - Attempts to transition from the given state based on the input. Returns the next state if a valid transition exists, or null if no transition is defined.
- `getOutput(): O | undefined` - Get the output associated with the current state
- `getCurrentState(): StateName` - Get the current state
- `reset(): void` - Reset the machine to its initial state

## How It Works

This FSM implements a Moore machine, where the output depends only on the current state, not on the input.


Key characteristics:
- The FSM maintains its current state internally.
- Transitions are triggered by input symbols, updating the internal state.
- Each state has an associated output.
- The `transition` method updates the internal state and returns the new state.

## Limitations

- The FSM does not support epsilon transitions (transition from one state to another without consuming any input symbol.)
- All states and transitions must be defined upfront
- The machine does not support dynamic addition or removal of states or transitions

## Example

Here's an example of using the FSM for a simple traffic light system:

```typescript
import FiniteStateMachine from "fsm-generator";
// Create and configure the FSM
const trafficLightFSM = new FiniteStateMachine({
    states: ["Red", "Yellow", "Green"],
    alphabet: ["Next"],
    initialState: "Red",
    acceptingStates: ["Red", "Green"],
    transitions: [
        ["Red", "Next", "Green"],
        ["Green", "Next", "Yellow"],
        ["Yellow", "Next", "Red"],
    ],
    outputs: [
        ["Red", "Stop"],
        ["Yellow", "Prepare to stop"],
        ["Green", "Go"],
    ],
});

// Use the FSM
trafficLightFSM.getCurrentState(); // 'Red'
trafficLightFSM.getOutput(); // 'Stop'
trafficLightFSM.transition("Next");
trafficLightFSM.getCurrentState(); // 'Green'
trafficLightFSM.getOutput(); // 'Go'
trafficLightFSM.transition("Next");
trafficLightFSM.getCurrentState(); // 'Yellow'
trafficLightFSM.getOutput(); // 'Prepare to stop'
trafficLightFSM.reset();
trafficLightFSM.getCurrentState(); // 'Red'
// Process a sequence of inputs
const result = trafficLightFSM.process("NextNextNext");
console.log(result);
// {
// accepted: true,
// output: 'Stop',
// finalState: 'Red'
// }


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
````
