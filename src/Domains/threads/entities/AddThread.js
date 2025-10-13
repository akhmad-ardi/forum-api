class AddThread {
  constructor(payload) {
    this._verifyPayload(payload);

    this.title = payload.title;
    this.body = payload.body;
  }

  _verifyPayload(payload) {
    if (!payload.title || !payload.body) {
      throw new Error("ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY");
    }

    if (typeof payload.title !== "string" || typeof payload.body !== "string") {
      throw new Error("ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
  }
}

module.exports = AddThread;
