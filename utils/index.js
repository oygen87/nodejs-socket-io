var exports = module.exports = {};
exports.mapEvents = e => {
    const issueUrl = e.payload.issue ? e.payload.issue.html_url : null;
    const pullRequestUrl = e.payload.pull_request ? e.payload.pull_request.html_url : null;
    const url = issueUrl ? issueUrl : pullRequestUrl ? pullRequestUrl : null;
    return {
      id: e.id,
      actor: e.actor.display_login,
      avatar: e.actor.avatar_url,
      action: e.payload.action ? e.payload.action : null,
      type: e.type.slice(0, -5),
      url,
      created: e.created_at,
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