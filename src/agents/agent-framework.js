/**
 * Agent framework: message types, status codes, factory helpers, and the pipeline orchestrator.
 * @module agent-framework
 * @example
 * ```javascript
 * import { Orchestrator, AgentMessageType } from './agent-framework.js';
 * const orchestrator = new Orchestrator({ analyze: myAgent });
 * const result = await orchestrator.run({ spec });
 * ```
 * @author Aydin Abdi <ayd.abd@gmail.com>
 * @license MIT
 */

/**
 * Agent message types for the pipeline steps.
 * @type {Readonly<{ANALYZE: string, PLAN: string, GENERATE: string, EXECUTE: string, REPORT: string}>}
 */
const AgentMessageType = Object.freeze({
    ANALYZE: 'ANALYZE',
    PLAN: 'PLAN',
    GENERATE: 'GENERATE',
    EXECUTE: 'EXECUTE',
    REPORT: 'REPORT',
});

/**
 * Pipeline step statuses.
 * @type {Readonly<{PENDING: string, IN_PROGRESS: string, DONE: string, FAILED: string}>}
 */
const StepStatus = Object.freeze({
    PENDING: 'PENDING',
    IN_PROGRESS: 'IN_PROGRESS',
    DONE: 'DONE',
    FAILED: 'FAILED',
});

/**
 * Maximum number of retry attempts per pipeline step.
 * @type {number}
 */
const MAX_RETRIES = 3;

/** @type {string[]} Pipeline step order */
const PIPELINE_ORDER = [
    AgentMessageType.ANALYZE,
    AgentMessageType.PLAN,
    AgentMessageType.GENERATE,
    AgentMessageType.EXECUTE,
    AgentMessageType.REPORT,
];

/**
 * Create a typed agent input message.
 * @param {string} type - The message type (AgentMessageType value).
 * @param {object} payload - The step-specific payload.
 * @param {object} context - Shared pipeline context.
 * @returns {{ type: string, payload: object, context: object }} Agent input.
 */
function createAgentInput(type, payload, context) {
    return { type, payload, context };
}

/**
 * Create a successful agent output message.
 * @param {string} type - The message type.
 * @param {object} payload - The result payload to merge into pipeline state.
 * @param {string} [status] - The status string.
 * @returns {{ type: string, payload: object, status: string }} Agent output.
 */
function createAgentOutput(type, payload, status = 'ok') {
    return { type, payload, status };
}

/**
 * Create an error agent output message.
 * @param {string} type - The message type.
 * @param {Error|string} error - The error that occurred.
 * @param {object} [context] - The context at the time of failure.
 * @returns {{ type: string, payload: null, status: string, error: string, context: object }} Error output.
 */
function createAgentError(type, error, context = {}) {
    return {
        type,
        payload: null,
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        context,
    };
}

/**
 * Pipeline orchestrator that drives agents through the checklist state machine.
 * @class Orchestrator
 * @example
 * ```javascript
 * const orch = new Orchestrator({ ANALYZE: analyzeAgent, PLAN: planAgent });
 * const result = await orch.run({ spec });
 * ```
 */
class Orchestrator {
    /**
     * Create a new Orchestrator.
     * @param {{[key: string]: (input: object) => Promise<object>}} agents - Map of step name → async agent function.
     * @param {object} [options] - Configuration options.
     * @param {number} [options.maxRetries] - Max retry attempts per step.
     */
    constructor(agents = {}, options = {}) {
        this._agents = agents;
        this._maxRetries = options.maxRetries ?? MAX_RETRIES;
        this._checklist = PIPELINE_ORDER.map((step) => ({
            step,
            status: StepStatus.PENDING,
            attempts: 0,
        }));
    }

    /**
     * Return a shallow copy of the checklist items.
     * @returns {Array<{step: string, status: string, attempts: number}>} Checklist copy.
     */
    getChecklist() {
        return this._checklist.map((item) => ({ ...item }));
    }

    /**
     * Run the full pipeline, dispatching each step to its registered agent.
     * @param {object} context - Initial pipeline context (e.g. spec, stories, har).
     * @returns {Promise<{status: string, checklist: Array, state: object, failedStep?: string, error?: string}>} Pipeline result.
     */
    async run(context) {
        const state = {};

        for (const item of this._checklist) {
            const agent = this._agents[item.step];
            if (!agent) {
                item.status = StepStatus.FAILED;
                return this._failResult(item.step, `No agent registered for step: ${item.step}`, state);
            }

            item.status = StepStatus.IN_PROGRESS;
            let lastError = '';

            while (item.attempts < this._maxRetries) {
                item.attempts += 1;
                const input = createAgentInput(item.step, state, context);
                const output = await agent(input);

                if (output.status !== 'error') {
                    Object.assign(state, output.payload ?? {});
                    item.status = StepStatus.DONE;
                    break;
                }

                lastError = output.error ?? 'Unknown error';
            }

            if (item.status !== StepStatus.DONE) {
                item.status = StepStatus.FAILED;
                return this._failResult(item.step, lastError, state);
            }
        }

        return { status: 'ok', checklist: this.getChecklist(), state };
    }

    /**
     * Build a failure result object.
     * @param {string} failedStep - The step that failed.
     * @param {string} error - The error message.
     * @param {object} state - The current pipeline state.
     * @returns {{ status: string, failedStep: string, error: string, checklist: Array, state: object }} Failure result.
     */
    _failResult(failedStep, error, state) {
        return { status: 'failed', failedStep, error, checklist: this.getChecklist(), state };
    }
}

export {
    AgentMessageType,
    StepStatus,
    MAX_RETRIES,
    createAgentInput,
    createAgentOutput,
    createAgentError,
    Orchestrator,
};
