"use strict";

(function (root) {
  const kinds = ["name", "description"];

  function emptyAnswers() {
    return { name: {}, description: {} };
  }

  function placeAnswer(answers, kind, targetId, choiceId, validIds) {
    if (!kinds.includes(kind) || !validIds.includes(targetId) || !validIds.includes(choiceId)) {
      throw new Error("Unknown answer field or specimen");
    }
    const next = { ...answers, [kind]: { ...answers[kind] } };
    const previousTarget = Object.keys(next[kind]).find(id => next[kind][id] === choiceId);
    const displaced = next[kind][targetId];
    if (previousTarget && previousTarget !== targetId) {
      if (displaced) next[kind][previousTarget] = displaced;
      else delete next[kind][previousTarget];
    }
    next[kind][targetId] = choiceId;
    return next;
  }

  function clearAnswer(answers, kind, targetId) {
    if (!kinds.includes(kind)) throw new Error("Unknown answer field");
    const next = { ...answers, [kind]: { ...answers[kind] } };
    delete next[kind][targetId];
    return next;
  }

  function gradeAnswers(answers, validIds) {
    const fields = kinds.flatMap(kind => validIds.map(id => ({
      id, kind, answer: answers[kind][id] || null,
      result: !answers[kind][id] ? "empty" : answers[kind][id] === id ? "correct" : "wrong"
    })));
    return {
      total: fields.length,
      filled: fields.filter(field => field.result !== "empty").length,
      correct: fields.filter(field => field.result === "correct").length,
      wrong: fields.filter(field => field.result === "wrong").length,
      empty: fields.filter(field => field.result === "empty").length,
      fields
    };
  }

  const api = { emptyAnswers, placeAnswer, clearAnswer, gradeAnswers };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.RockQuiz = api;
})(globalThis);
