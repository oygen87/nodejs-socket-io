const { validatePayload, filterEvents, mapEvents } = require("../utils/utils");

test("validatePayload", () => {
  const payload_1 = {
    username: "test-bot",
    message: "hey world!",
    repo: "https://github.com/facebook/react"
  };
  expect(validatePayload(payload_1)).toBe(true);

  const payload_2 = {
    username: "",
    message: "hey world!",
    repo: "https://github.com/facebook/react"
  };
  expect(validatePayload(payload_2)).toBe(false);

  const payload_3 = {
    username: "",
    message: "",
    repo: "https://github.com/facebook/react"
  };
  expect(validatePayload(payload_3)).toBe(false);

  const payload_4 = {
    username: "",
    message: "",
    repo: ""
  };
  expect(validatePayload(payload_4)).toBe(false);

  const payload_5 = {
    foo: "bar"
  };
  expect(() => {
    validatePayload(payload_5);
  }).toThrow();
});

test("filterEvents", () => {
  const event_1 = {
    type: "Comment"
  };
  expect(filterEvents(event_1)).toBe(true);

  const event_2 = {
    type: "Watch"
  };
  expect(filterEvents(event_2)).toBe(false);

  const event_3 = {
    type: "Fork"
  };
  expect(filterEvents(event_3)).toBe(false);

  const event_4 = {
    type: "Follow"
  };
  expect(filterEvents(event_4)).toBe(false);

  const event_5 = {
    type: "Download"
  };
  expect(filterEvents(event_5)).toBe(false);
});

test("mapEvents", () => {
  const event_1 = {
    id: 123,
    created_at: "2015-05-21T22:43:05Z",
    type: "IssueCommentEvent",
    actor: {
      display_login: "bill gates",
      avatar_url: "google.com/image.png"
    },
    payload: {
      action: "foo",
      issue: {
        html_url: "https://github.com/facebook/react/issues/123"
      }
    }
  };
  const mappedEvents_1 = [event_1].map(mapEvents);
  expect(mappedEvents_1[0].action).toBe(null);
  expect(mappedEvents_1[0].type).toBe("commented issue");
  expect(mappedEvents_1[0].url).toBe(
    "https://github.com/facebook/react/issues/123"
  );
  expect(typeof mappedEvents_1[0].id).toBe("string");

  const event_2 = {
    id: 123,
    created_at: "2015-05-21T22:43:05Z",
    type: "PullRequestEvent",
    actor: {
      display_login: "bill gates",
      avatar_url: "google.com/image.png"
    },
    payload: {
      action: "opened",
      issue: {
        html_url: "https://github.com/facebook/react/pulls/123"
      }
    }
  };
  const mappedEvents_2 = [event_2].map(mapEvents);
  expect(mappedEvents_2[0].action).toBe("opened");
  expect(mappedEvents_2[0].type).toBe("PullRequest");
  expect(mappedEvents_2[0].url).toBe(
    "https://github.com/facebook/react/pulls/123"
  );
  expect(typeof mappedEvents_2[0].id).toBe("string");
});
