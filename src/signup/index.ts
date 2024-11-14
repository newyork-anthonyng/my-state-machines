import { createMachine, assign, assertEvent } from "xstate";

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

const PASSWORD_MIN_LENGTH = 8;

const machine = createMachine(
  {
    id: "signup",
    initial: "ready",
    context: {
      email: "",
      password: "",
    },
    types: {
      context: {} as {
        email: string;
        password: string;
      },
      events: {} as
        | {
            type: "CHANGE_EMAIL";
            value: string;
          }
        | {
            type: "CHANGE_PASSWORD";
            value: string;
          }
        | { type: "SUBMIT" },
    },
    states: {
      ready: {
        onDone: {
          target: "submitting",
        },
        on: {
          CHANGE_EMAIL: {
            actions: "cacheEmail",
            target: "ready.email.ok",
          },
          CHANGE_PASSWORD: {
            actions: "cachePassword",
            target: "ready.password.ok",
          },
        },

        type: "parallel",

        states: {
          email: {
            initial: "ok",
            states: {
              ok: {},
              submitting: {
                type: "final",
              },
              error: {
                initial: "empty",
                states: {
                  none: {},
                  empty: {},
                  invalid: {},
                },
              },
            },
            on: {
              SUBMIT: [
                { guard: "isEmailEmpty", target: ".error.empty" },
                { guard: "isInvalidEmail", target: ".error.invalid" },
                { target: ".submitting" },
              ],
            },
          },
          password: {
            initial: "ok",
            states: {
              ok: {},
              submitting: {
                type: "final",
              },
              error: {
                initial: "none",
                states: {
                  none: {},
                  empty: {},
                  tooShort: {},
                },
              },
            },
            on: {
              SUBMIT: [
                { guard: "isPasswordEmpty", target: ".error.empty" },
                { guard: "isPasswordTooShort", target: ".error.tooShort" },
                { target: ".submitting" },
              ],
            },
          },
        },
      },
      submitting: {},
    },
  },
  {
    guards: {
      isEmailEmpty: ({ context }) => context.email.trim() === "",
      isInvalidEmail: ({ context }) => !isValidEmail(context.email),
      isPasswordEmpty: ({ context }) => context.password.trim() === "",
      isPasswordTooShort: ({ context }) =>
        context.password.length < PASSWORD_MIN_LENGTH,
    },
    actions: {
      cacheEmail: assign(({ event }) => {
        assertEvent(event, "CHANGE_EMAIL");

        return {
          email: event.value,
        };
      }),

      cachePassword: assign(({ event }) => {
        assertEvent(event, "CHANGE_PASSWORD");

        return {
          password: event.value,
        };
      }),
    },
  }
);

export default machine;
