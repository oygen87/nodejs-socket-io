var exports = (module.exports = {});
exports.mapEvents = e => {
  const id = e.id;
  const actor = e.actor.display_login;
  const avatar = e.actor.avatar_url;
  const created = e.created_at;
  const issueUrl = e.payload.issue ? e.payload.issue.html_url : null;
  const pullRequestUrl = e.payload.pull_request
    ? e.payload.pull_request.html_url
    : null;
  const url = issueUrl ? issueUrl : pullRequestUrl ? pullRequestUrl : null;
  let action = e.payload.action ? e.payload.action : null;
  let type = e.type.slice(0, -5);

  if (type.includes("Comment")) {
    action = null;
    if (type.includes("PullRequest")) {
      type = "commented pull request";
    }
    if (type.includes("Issue")) {
      type = "commented issue";
    }
    if (type.includes("Commit")) {
      type = "commented commit";
    }
  }
  type = type === "Issues" ? "Issue" : type;
  type = type === "Push" ? "Pushed to " + e.payload.ref : type;

  return {
    id,
    actor,
    avatar,
    action,
    type,
    url,
    created
  };
};

exports.filterEvents = e => {
  return (
    e.type !== "Watch" &&
    e.type !== "Fork" &&
    e.type !== "Follow" &&
    e.type !== "Download"
  );
};

exports.validatePayload = payload => {
  return (
    payload.message.trim().length !== 0 &&
    payload.username.trim().length !== 0 &&
    payload.repo.trim().length !== 0
  );
};
