const { validatePayload } = require("../utils/utils");

test("validatePayload", () => {
  const payload_1 = {
    username: "test-bot",
    message: "hey world!",
    repo: "https://github.com/facebook/react"
  };

  const payload_2 = {
    username: "",
    message: "hey world!",
    repo: "https://github.com/facebook/react"
  };

  const payload_3 = {
    username: "",
    message: "",
    repo: "https://github.com/facebook/react"
  };

  const payload_4 = {
    username: "",
    message: "",
    repo: ""
  };

  const payload_5 = {
    foo: "bar"
  };

  expect(validatePayload(payload_1)).toBe(true);

  expect(validatePayload(payload_2)).toBe(false);
  expect(validatePayload(payload_3)).toBe(false);
  expect(validatePayload(payload_4)).toBe(false);

  expect(() => {
    validatePayload(payload_5);
  }).toThrow();
});
