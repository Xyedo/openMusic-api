/* eslint-disable no-undef */
const { expect } = require("chai");
const InvariantError = require("../../src/exceptions/invariantError");
const UsersValidator = require("../../src/validator/users");

describe("user validator", () => {
  it("true user payload", () => {
    const userPayload = {
      username: "hafidMahdi",
      password: "supersecretpassword",
      fullname: "Hafid Mahdi AN",
    };
    expect(() =>
      UsersValidator.validateUserPayload(userPayload)
    ).not.to.throw();
  });

  it("true but have whitespace in left and right", () => {
    const userPayload = {
      username: "   hafidMahdi   ",
      password: "supersecretpassword",
      fullname: "  Hafid Mahdi AN   ",
    };
    expect(() =>
      UsersValidator.validateUserPayload(userPayload)
    ).not.to.throw();
  });
  it("expected to throw error cos username have whitespaces", () => {
    const userPayload = {
      username: "   hafid Mahdi   ",
      password: "supersecretpassword",
      fullname: "  Hafid Mahdi AN   ",
    };
    const testFunc = () => {
      UsersValidator.validateUserPayload(userPayload);
    };
    expect(testFunc)
      .to.throw(InvariantError)
      .to.have.property(
        "message",
        `"username" with value "hafid Mahdi" fails to match the required pattern: ${/^\S*$/}`
      );
  });
  it("expected to throw when properties false", () => {
    const userPayload = {
      userName: "   hafid Mahdi   ",
      passWord: "supersecretpassword",
      fullname: "  Hafid Mahdi AN   ",
    };
    expect(() => {
      UsersValidator.validateUserPayload(userPayload);
    })
      .to.throw(InvariantError)
      .to.have.property("message", `"username" is required`);
  });
});
