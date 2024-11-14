import { createActor } from "xstate";
import machine from "./index";

it("should update context when changing email", () => {
  const actor = createActor(machine).start();

  const newEmail = "test@gmail.com";
  actor.send({ type: "CHANGE_EMAIL", value: newEmail });

  expect(actor.getSnapshot().context.email).toEqual(newEmail);
});

it("should update password when changing password", () => {
  const actor = createActor(machine).start();

  const newPassword = "password";
  actor.send({ type: "CHANGE_PASSWORD", value: newPassword });

  expect(actor.getSnapshot().context.password).toEqual(newPassword);
});

it("should go into submitting state when submitting with a valid email and password", () => {
  const actor = createActor(machine).start();

  actor.send({ type: "CHANGE_EMAIL", value: "test@gmail.com" });
  actor.send({ type: "CHANGE_PASSWORD", value: "password" });
  actor.send({ type: "SUBMIT" });

  expect(actor.getSnapshot().matches("submitting")).toBeTruthy();
});

describe("email error", () => {
  it("should go into error state when submitting with an empty email", () => {
    const actor = createActor(machine).start();

    actor.send({ type: "CHANGE_PASSWORD", value: "password" });
    actor.send({ type: "SUBMIT" });

    expect(actor.getSnapshot().matches("ready.email.error.empty")).toBeTruthy();
  });

  it("should go into error state when submitting with an invalid email", () => {
    const actor = createActor(machine).start();

    actor.send({ type: "CHANGE_EMAIL", value: "invalid-email" });
    actor.send({ type: "CHANGE_PASSWORD", value: "password" });
    actor.send({ type: "SUBMIT" });

    expect(
      actor.getSnapshot().matches("ready.email.error.invalid")
    ).toBeTruthy();
  });

  it("should clear error state when changing email", () => {
    const actor = createActor(machine).start();

    actor.send({ type: "CHANGE_PASSWORD", value: "password" });
    actor.send({ type: "SUBMIT" });
    actor.send({ type: "CHANGE_EMAIL", value: "test@gmail.com" });

    expect(actor.getSnapshot().matches("ready.email.ok")).toBeTruthy();
  });
});

describe("password error", () => {
  it("should go into error state when submitting with an empty password", () => {
    const actor = createActor(machine).start();

    actor.send({ type: "CHANGE_EMAIL", value: "test@gmail.com" });
    actor.send({ type: "SUBMIT" });

    expect(
      actor.getSnapshot().matches("ready.password.error.empty")
    ).toBeTruthy();
  });

  it("should go into error state when submitting with a password that is too short", () => {
    const actor = createActor(machine).start();

    actor.send({ type: "CHANGE_EMAIL", value: "test@gmail.com" });
    actor.send({ type: "CHANGE_PASSWORD", value: "short" });
    actor.send({ type: "SUBMIT" });

    expect(
      actor.getSnapshot().matches("ready.password.error.tooShort")
    ).toBeTruthy();
  });

  it("should clear error state when changing password", () => {
    const actor = createActor(machine).start();

    actor.send({ type: "CHANGE_EMAIL", value: "test@gmail.com" });
    actor.send({ type: "SUBMIT" });
    actor.send({ type: "CHANGE_PASSWORD", value: "password" });

    expect(actor.getSnapshot().matches("ready.password.ok")).toBeTruthy();
  });
});
